import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import WebSocket from "ws";

import { Pool } from 'pg';
import http from "http";
import { Server } from "socket.io";
import { count } from 'console';
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});


const app = express();
app.use(cors({
  origin: "http://localhost:5173", // Frontend origin
  credentials: true                // Allow cookies
}));


const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.json());
app.use(cookieParser());


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});



server.listen(5000, () => {
  console.log('✅ Server running on http://localhost:5000');
});

// PostgreSQL connection setup
const pool = new Pool({
  user: 'postgres',         // or your db user
  host: 'localhost',
  database: 'postgres',     // your database name
  password: 'postgres', // your postgres password
  port: 5432,
});

// Login API
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  let userId = null;
  let userName = null;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (user) {
      userId = user.id;
      userName = user.name;
    }

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // const match = await bcrypt.compare(password, user.password_hash);

    // if (!match) return res.status(401).json({ error: 'Invalid credentials' });


    const token = jwt.sign({ userId, userName }, JWT_SECRET, { expiresIn: "1h" });

      res.cookie("token", token, {
        httpOnly: true,
        secure: false, // set to true in production with HTTPS
        sameSite: "Strict",
        maxAge: 60 * 60 * 1000
      });

    res.json({ message: 'Login successful', userId: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('INSERT INTO users (email, password_hash) VALUES ($1, $2)', [email, password]);


    if (!result) return res.status(401).json({ error: 'Invalid credentials' });

    // const match = await bcrypt.compare(password, user.password_hash);

    // if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ message: 'Signup successful'});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get("/api/user", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ userId: decoded.userId, userName: decoded.userName });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

app.post('/api/editUserName', async (req, res) => {
   const { userid } = req.body;
   const { username } = req.body;


    try {
      const result = await pool.query(
        `UPDATE users
        SET name = $1
        WHERE id = $2`,
        [username, userid]
      );

      res.status(201).json({ success: true });

    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
});



app.post('/api/getUserFriend', async (req, res) => {
  const search = req.body.search || '';


    try {
      const result = await pool.query(
        `SELECT id, name
        FROM users
        WHERE LOWER(name) LIKE $1
        ORDER BY id ASC`,
        [`%${search.toLowerCase()}%`]
      );

      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/getProfile', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);


    try {
      const result = await pool.query(
        `SELECT *
        FROM users
        WHERE id = $1`,
        [decoded.userId]
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

app.post('/api/getUsersCount', async (req, res) => {
  const search = req.body.search || '';

  console.log(search);


    try {
      const result = await pool.query(
        `SELECT COUNT(*) AS total
        FROM users`
      );

      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/getSelectFriend', async (req, res) => {
   const {search = ""} = req.query;
   const cleanedSearch = String(search || '').trim();


    try {
      const result = await pool.query(
        `SELECT id, name, email
        FROM users
        WHERE name ILIKE $1
        ORDER BY id ASC
        LIMIT 50`,
        [`%${cleanedSearch}%`]
      );

      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/users
app.get('/api/getAllUsers', async (req, res) => {
  const search = req.query.search?.toString() || '';
  const user = req.query.us?.toString();
  const cursorId = req.query.nextIdCursor?.toString();
  const limit = parseInt(req.query.limit) || 10;

  try {
    const values = [`%${search}%`, limit + 1, user];
    let cursorCondition = '';

    if (cursorId) {
      cursorCondition = `AND (users.id) > ($4)`;
      values.push(cursorId);
    }
    
    const query = `
      WITH relevant_requests AS (
    SELECT sender_id, receiver_id
    FROM friend_requests
    WHERE sender_id = $3 OR receiver_id = $3
    )
    SELECT 
      users.id AS users_id,
      users.name,
      relevant_requests.receiver_id
    FROM users
    LEFT JOIN relevant_requests
      ON users.id = relevant_requests.receiver_id
    WHERE users.name ILIKE $1
    ${cursorCondition}
    ORDER BY users.id ASC
    LIMIT $2
    `;

    const { rows } = await pool.query(query, values);

    const hasMore = rows.length > limit;
    const result = hasMore ? rows.slice(0, limit) : rows;

    const last = result[result.length - 1];

    res.json({
      users: result,
      hasMore,
      nextCursor: hasMore
        ? { id: last.users_id}
        : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }

});


app.post('/api/createGroup', async (req, res) => {
   const {groupName, users} = req.body;


    try {
      const result = await pool.query(
        `INSERT INTO chatrooms (name, is_group)
        VALUES ($1, true)
         RETURNING id`,
        [groupName]
      );

      const chatroomId = result.rows[0].id;

for (const user of users) {
  await pool.query(
    `INSERT INTO chatroom_users (chatroom_id, user_id, user_type)
     VALUES ($1, $2, $3)`,
    [chatroomId, user.userId, user.type]
  );
}


      res.json({
        chatroom_id: chatroomId, 
        chatroom_name: groupName
      });
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/editGroup', async (req, res) => {
   const {groupName} = req.body;
   const {room} = req.body;


    try {
      const result = await pool.query(
        `UPDATE chatrooms
        SET name = $1
        WHERE id = $2`,
        [groupName, room]
      );

      res.status(201).json({ success: true });

    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
});

app.post("/api/deleteGroupMember", async (req, res) => {
  const client = await pool.connect();

  try {
    const { room, user } = req.body;

    await client.query("BEGIN");

    const result = await client.query(
      `DELETE FROM chatroom_users
       WHERE chatroom_id = $1
       AND user_id = $2
       RETURNING *`,
      [room, user]
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Member not found" });
    }

    await client.query("COMMIT");

    return res.json(result.rows[0]);

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Transaction failed:", err);
    return res.status(500).json({ error: "Server error" });

  } finally {
    client.release(); // <-- This is correct
  }
});

app.post("/api/createGroupMember", async (req, res) => {
  const client = await pool.connect();

  try {
    const { room, user } = req.body;

    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO chatroom_users (chatroom_id, user_id, user_type)
       VALUES ($1, $2, $3)`,
      [room, user, 'member']
    );

    

    await client.query("COMMIT");

    return res.json({
      user
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Transaction failed:", err);
    return res.status(500).json({ error: "Server error" });

  } finally {
    client.release(); // <-- This is correct
  }
});




const userSockets = new Map();

io.on("connection", (socket) => {

  socket.on("identify", (userId,room) => {
    userSockets.set(userId, socket.id);
    

     console.log("User connected:", userId, socket.id);

  });
  

  socket.on("chat message:send", async (msg) => {
    const { id, fromId, name, chatroomId, toId, content } = msg;
    // Save text message
    const client = await pool.connect();

    if (chatroomId) {
      const getChatroomUserByChatroomId = `
      SELECT user_id
      FROM chatroom_users
      WHERE chatroom_id = $1
        AND user_id != $2;
      `;

      let { rows } = await client.query(getChatroomUserByChatroomId, [chatroomId, fromId]);



      try {

      let messageSent = null;

      try {
        await client.query('BEGIN');

        messageSent = await client.query(
          `INSERT INTO messages (chatroom_id, from_user_id, content) VALUES ($1, $2, $3) RETURNING id`,
          [chatroomId, fromId, content]
        );

        await client.query('COMMIT');
        } catch (error) {
          await client.query('ROLLBACK');
          console.error('Transaction failed:', error);
          throw error; // or return an error response
        } finally {
          client.release();
        }

        const senderSocket = userSockets.get(fromId);
        console.log(rows)

          
          rows.forEach(user => {
            const recipientSocket = userSockets.get(user.user_id);
            for (let [userId, socketId] of userSockets.entries()) {
              console.log(`User ${userId} is connected with socket ${socketId}`);
            }
            if (recipientSocket) {
              io.to(recipientSocket).emit("chat message:notifyreci", {
                id : messageSent.rows[0].id,
                chatroomid : chatroomId,
                name : name,
                content: content
              });
            }
            if (senderSocket) {
              io.to(senderSocket).emit("chat message:notifysend", {
                id : messageSent.rows[0].id,
                tempId : id,
                name : name,
                content : content
              });
            }
            
          });
          
          

          
        } catch (err) {
          console.error("❌ DB insert error:", err);
        }

        

        

        
    } else {

      try {

      let messageSent = null;
      let roomId = null;

      try {
        await client.query('BEGIN');
        const getChatroomQuery = `
          SELECT c.id
          FROM chatrooms c
          JOIN chatroom_users cu ON cu.chatroom_id = c.id
          WHERE c.is_group = false
            AND cu.user_id IN ($1, $2)
          GROUP BY c.id
          HAVING COUNT(DISTINCT cu.user_id) = 2;
        `;

      let chatroomUser = await client.query(getChatroomQuery, [fromId, toId]);

      if (chatroomUser.rows.length > 0) {
        roomId = chatroomUser.rows[0].id;
      } else {
        const insertChatroom = `
          INSERT INTO chatrooms (is_group) VALUES (FALSE) RETURNING id
        `;
        const chatroomRes = await client.query(insertChatroom);
        roomId = chatroomRes.rows[0].id;

        await client.query(
          `INSERT INTO chatroom_users (chatroom_id, user_id, user_type) VALUES 
            ($1, $2, 'private'),
            ($1, $3, 'private')`,
          [roomId, fromId, toId]
        );
      }

      messageSent = await client.query(
        `INSERT INTO messages (chatroom_id, from_user_id, content) VALUES ($1, $2, $3) RETURNING id`,
        [roomId, fromId, content]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction failed:', error);
      throw error; // or return an error response
    } finally {
      client.release();
    }

    const recipientSocket = userSockets.get(toId);

      const senderSocket = userSockets.get(fromId);

      for (let [userId, socketId] of userSockets.entries()) {
        console.log(`User ${userId} is connected with socket ${socketId}`);
      }
      if (recipientSocket) {
        io.to(recipientSocket).emit("chat message:notifyreci", {
          id : messageSent.rows[0].id,
          chatroomid : roomId,
          name : name,
          content: content
        });
      }
      if (senderSocket) {
        io.to(senderSocket).emit("chat message:notifysend", {
          id : messageSent.rows[0].id,
          tempId : id,
          name : name,
          content : content
        });
      }  

      
    } catch (err) {
      console.error("❌ DB insert error:", err);
    }

      
    }
  });

  socket.on("chat message:read", async (msg) => {
    const { roomId, userId } = msg;
    console.log(msg);

    const readSocket = userSockets.get(userId);

    let messageId;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const getMessageQuery = `
        SELECT id
        FROM messages
        WHERE from_user_id != $1
        AND chatroom_id = $2
        AND read = false;
      `;

      let result = await client.query(getMessageQuery, [userId,roomId]);
      
      if (result.rows.length > 0) {
        messageId = result.rows.map(row => row.id);
        
        await client.query(
          `UPDATE messages
            SET read = $1
            WHERE id = ANY($2);
            `,
          ['true', messageId]
        );        
      }
      await client.query('COMMIT');

      if (readSocket) {
        io.to(readSocket).emit("chat message:notifyread", {
          roomid : roomId,
          count : result.rows.length
        });
      }

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction failed:', error);
      throw error; // or return an error response
    } finally {
      client.release();
    }      
  })

  socket.on("friend request:send", async (req) => {
  const { receiver, user } = req;

  const userId = user.userId;
  
  const requestSocket = userSockets.get(receiver);

  const result = await pool.query(
    `INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES ($1, $2, $3) RETURNING *`,
    [userId, receiver, "Pending"]
  );
  
  


  if (requestSocket) {
    io.to(requestSocket).emit("friend request:notifyreci", {
      result
    });
  }

      
  })


  socket.on("disconnect", () => {
    for (let [userId, id] of userSockets) {
      if (id === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
  });
});

app.get("/messages/:from/:to", async (req, res) => {
  const { from, to } = req.body;
  const result = await pool.query(
    `SELECT * FROM messages
     WHERE (from_user_id = $1 AND to_user_id = $2)
        OR (from_user_id = $2 AND to_user_id = $1)
     ORDER BY created_at`,
    [from, to]
  );
  res.json(result.rows);
});

app.post("/api/sendMessage", async (req, res) => {
  const { from, to, text, timestamp  } = req.body;
  
  
  

  // 1. Get or create chatroom ID for private chat
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const getChatroomQuery = `
      SELECT c.id
      FROM chatrooms c
      JOIN chatroom_users cu1 ON cu1.chatroom_id = c.id AND cu1.user_id = $1
      JOIN chatroom_users cu2 ON cu2.chatroom_id = c.id AND cu2.user_id = $2
      WHERE c.is_group = FALSE
      GROUP BY c.id
      HAVING COUNT(*) = 2
    `;

    let result = await client.query(getChatroomQuery, [from, to]);
    let chatroomId;

    if (result.rows.length > 0) {
      chatroomId = result.rows[0].id;
    } else {
      const insertChatroom = `
        INSERT INTO chatrooms (is_group) VALUES (FALSE) RETURNING id
      `;
      const chatroomRes = await client.query(insertChatroom);
      chatroomId = chatroomRes.rows[0].id;

      await client.query(
        `INSERT INTO chatroom_users (chatroom_id, user_id) VALUES 
          ($1, $2),
          ($1, $3)`,
        [chatroomId, from, to]
      );
    }

    await client.query(
      `INSERT INTO messages (chatroom_id, sender_id, content) VALUES ($1, $2, $3)`,
      [chatroomId, from, text]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction failed:', error);
    throw error; // or return an error response
  } finally {
    client.release();
  }


});

app.post("/api/getMessage", async (req, res) => {
  const { room } = req.body;

  const result = await pool.query(
    `SELECT 
     messages.id, messages.content, messages.created_at, users.name, messages.read
    FROM messages JOIN users ON messages.from_user_id = users.id
    WHERE messages.chatroom_id = $1
    ORDER BY messages.id ASC`,
    [room]
  );
  
  res.json(result.rows);

});

app.post("/api/deleteMessage", async (req, res) => {

  try {
    const { message } = req.body;

    await pool.query("BEGIN");


    const result = await pool.query(
      `DELETE
      FROM messages
      WHERE messages.id = $1 RETURNING *`,
      [message]
    );

    if (result.rowCount === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ error: "Message not found" });
    }

    await pool.query("COMMIT");
    
    res.json(result.rows[0]);

  }catch(err) {
    await pool.query("ROLLBACK");
    console.error("Transaction failed:", err);
    res.status(500).json({ error: "Server error" });
  } finally {
    pool.release();
  }

});



app.post("/api/getChatRoom", async (req, res) => {
  const { userId } = req.body;

  const result = await pool.query(
    `
    (
      SELECT 
          c.id AS chatroom_id,
          c.name AS chatroom_name,
          is_group,
          cu.user_type
      FROM chatrooms c
      JOIN chatroom_users cu ON cu.chatroom_id = c.id
      WHERE cu.user_id = $1 AND c.is_group = true      )
      UNION ALL
      (
        SELECT 
            c.id AS chatroom_id,
            u.name AS chatroom_name,
            is_group,
            cu1.user_type
        FROM chatrooms c
        JOIN chatroom_users cu1 ON cu1.chatroom_id = c.id AND cu1.user_id = $1
        JOIN chatroom_users cu2 ON cu2.chatroom_id = c.id AND cu2.user_id != cu1.user_id
        JOIN users u ON u.id = cu2.user_id
        WHERE c.is_group = false
      )
      `,
    [userId]
  );
  
  res.json(result.rows);


});

app.post("/api/getChatroomNotification", async (req, res) => {
  const { userId } = req.body;

  const chatroomResult = await pool.query(
    `SELECT 
     chatrooms.id AS chatroom_id
    FROM chatrooms
    JOIN chatroom_users ON chatrooms.id = chatroom_id
    WHERE user_id = $1`,
    [userId]
  );

  const chatroomIds = chatroomResult.rows.map(row => row.chatroom_id);


  const result = await pool.query(
    `SELECT messages.chatroom_id AS id, COUNT (messages.id) AS count
    FROM messages 
    WHERE messages.chatroom_id = ANY($1)
    AND messages.from_user_id != $2
    AND messages.read = $3
    GROUP BY messages.chatroom_id`,
    [chatroomIds, userId, false]
  )

  const unreadCounts = result.rows.map(r => ({
    id: r.id,
    count: parseInt(r.count, 10)
  }));
  
  res.json(unreadCounts);


});

app.get("/api/getUserGroupMember", async (req, res) => {
  const {search = ""} = req.query;
  const room = req.query.rm?.toString();
  const cursorId = req.query.nextIdCursor?.toString();
  const limit = parseInt(req.query.limit) || 10;

  try {
    const values = [room, `%${search}%`, limit + 1, ];
    let cursorCondition = '';

    if (cursorId) {
      cursorCondition = `AND (users.id) > ($4)`;
      values.push(cursorId);
    }
    
    const query = `
    SELECT 
      users.id AS user_id,
      users.name,
      chatroom_users.user_type
    FROM chatroom_users
    RIGHT JOIN users 
      ON chatroom_users.user_id = users.id
      AND chatroom_users.chatroom_id = $1
    WHERE users.name ILIKE $2
    ${cursorCondition}
    ORDER BY chatroom_users.chatroom_users_id ASC
    LIMIT $3
    `;

    const { rows } = await pool.query(query, values);

    const hasMore = rows.length > limit;
    const result = hasMore ? rows.slice(0, limit) : rows;

    const last = result[result.length - 1];

    res.json({
      members: result,
      hasMore,
      nextCursor: hasMore
        ? { id: last.user_id}
        : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }


});

app.post("/api/getAIReply", async (req, res) => {
  const { room, user } = req.body;

  const messageResult = await pool.query(
    `SELECT 
     messages.content, messages.from_user_id
    FROM messages
    WHERE chatroom_id = $1`,
    [room]
  );

  const message = messageResult.rows.map(r => ({
    from_user_id: r.from_user_id,
    content: r.content
  }));

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Given the following messages and from user id array, reply as user ${user} . ${JSON.stringify(message)}`,
  });
  res.json(response.text);


});

app.post("/api/createFriendRequest", async (req, res) => {
  const { user, receiver } = req.body;

  const userId = user.id;


  const result = await pool.query(
    `INSERT INTO friend_requests (sender_id, receiver_id, status, requested_at) VALUES ($1, $2, $3, NOW())`,
    [userId, receiver, "Pending"]
  );
  
  res.status(201).json({ success: true });

});

app.post("/api/getFriendRequest", async (req, res) => {
  const user = req.body.us;
  const cursorId = req.body.nextIdCursor;
  const limit = 10;

  const userId = user.userId;

  try {

    const values = [userId, limit + 1];
    let cursorCondition = '';

    if (cursorId) {
      cursorCondition = `AND (friend_requests.id) > ($3)`;
      values.push(cursorId);
    }

    const { rows } = await pool.query(
    `SELECT friend_requests.id AS friend_requests_id, sender_id, name, status, requested_at
        FROM friend_requests
        JOIN users ON friend_requests.sender_id = users.id
        WHERE friend_requests.receiver_id = $1
        AND friend_requests.status = 'Pending'
        ${cursorCondition}
        ORDER BY requested_at ASC
        LIMIT $2`,
        values
  );

  const hasMore = rows.length > limit;
  const result = hasMore ? rows.slice(0, limit) : rows;

  const last = result[result.length - 1];

  res.json({
      request: result,
      hasMore,
      nextCursor: hasMore
        ? { id: last.friend_requests_id}
        : null,
    });
  }catch(error){
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }

  
  
  

});

app.post("/api/getFriendRequestCount", async (req, res) => {
  const user = req.body.us;

  const userId = user;

  try {

    const values = [userId];

    const { rows } = await pool.query(
    `SELECT COUNT(*) AS total
        FROM friend_requests
        JOIN users ON friend_requests.sender_id = users.id
        WHERE friend_requests.receiver_id = $1
        AND friend_requests.status = 'Pending'`,
        values
  );

  const result = rows;

  res.json({
      result
    });
  }catch(error){
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }

  
  
  

});

app.post("/api/updateFriendRequestStatus", async (req, res) => {
  const {request, status} = req.body;


  try {
  // Begin transaction
  await pool.query('BEGIN');

  // 1️⃣ Update friend request status and get sender/receiver
  const result = await pool.query(
    `UPDATE friend_requests
     SET status = $1, responded_at = NOW()
     WHERE id = $2
     RETURNING sender_id, receiver_id`,
    [status, request]
  );

  // 2️⃣ If accepted, insert into friends table
  if (status === 'Accept' && result.rows.length > 0) {
    const { sender_id, receiver_id } = result.rows[0];

    await pool.query(
      `INSERT INTO friends (user_id, friend_id, created_at)
       VALUES ($1, $2, NOW()), ($2, $1, NOW())
       ON CONFLICT DO NOTHING`, // prevents duplicates
      [sender_id, receiver_id]
    );
  }

  // 3️⃣ Commit transaction
  await pool.query('COMMIT');

  res.status(201).json({ success: true });

} catch (error) {
  // Rollback transaction on error
  await pool.query('ROLLBACK');
  console.error(error);
  res.status(500).json({ error: 'Server error' });
}

  
  
  

});



