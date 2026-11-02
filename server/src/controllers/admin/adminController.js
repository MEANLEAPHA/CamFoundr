const pool = require("../../config/db");
const { createToken } = require("../../service/token/jwtHelp");
const { ADMIN_SECRET } = require("../../middleware/adminMiddleware");
const { cachePost } = require("../../config/redisClient");

// Auto-initialize admin tables and columns if not already created
let schemaInitialized = false;
const ensureSchema = async () => {
  if (schemaInitialized) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        event_date TIMESTAMP WITH TIME ZONE NOT NULL,
        end_date TIMESTAMP WITH TIME ZONE,
        banner_url TEXT,
        category VARCHAR(100) DEFAULT 'General',
        status VARCHAR(50) DEFAULT 'upcoming',
        capacity INTEGER DEFAULT 100,
        registered_count INTEGER DEFAULT 0,
        created_by INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS user_bans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        banned_by INTEGER,
        reason TEXT,
        status VARCHAR(50) DEFAULT 'banned',
        banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        reviewed_at TIMESTAMP WITH TIME ZONE
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
    `);
    schemaInitialized = true;
  } catch (err) {
    console.warn("[AdminSchema] Schema check warning (may already exist):", err.message);
  }
};

// Admin Login
const adminLogin = async (req, res) => {
  try {
    await ensureSchema();
    const { key, email, password } = req.body;

    // Direct key authentication
    if (key && (key === ADMIN_SECRET || key === process.env.ADMIN_KEY)) {
      const token = createToken({ userId: 1, role: "admin", username: "Master Admin" });
      return res.json({
        token,
        user: { id: 1, username: "Master Admin", email: "admin@camfoundr.com", role: "admin" },
        message: "Admin authentication successful",
      });
    }

    // Email/password login with admin check
    if (email && password) {
      const userResult = await pool.query(
        "SELECT id, username, email, password_hash, role, is_banned FROM users WHERE lower(email) = $1",
        [email.trim().toLowerCase()]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = userResult.rows[0];
      const bcrypt = require("bcrypt");
      const match = user.password_hash ? await bcrypt.compare(password, user.password_hash) : false;

      // Allow if password matches and user has admin role or is first user
      if (match && (user.role === "admin" || user.id === 1)) {
        const token = createToken({ userId: user.id, role: "admin", username: user.username });
        return res.json({
          token,
          user: { id: user.id, username: user.username, email: user.email, role: "admin" },
          message: "Admin logged in successfully",
        });
      }
    }

    return res.status(401).json({ message: "Invalid admin key or credentials" });
  } catch (err) {
    console.error("[adminLogin]", err);
    return res.status(500).json({ message: "Admin login error" });
  }
};

// Get current admin user
const getAdminMe = async (req, res) => {
  return res.json({
    user: {
      id: req.user?.userId || req.user?.id || 1,
      username: req.user?.username || "Admin",
      role: "admin",
    },
  });
};

// ----------------------------------------------------
// DASHBOARD STATS
// ----------------------------------------------------
const getDashboardStats = async (req, res) => {
  try {
    await ensureSchema();

    // Query various metrics in parallel
    const [
      userStats,
      postStats,
      blogStats,
      gifStats,
      eventStats,
      reportStats,
      recentBlogs,
      recentUsers,
    ] = await Promise.all([
      // Users count & banned count
      pool.query(`
        SELECT 
          COUNT(*)::int AS total_users,
          COUNT(*) FILTER (WHERE is_banned = true)::int AS banned_users,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS new_users_week
        FROM users
      `).catch(() => ({ rows: [{ total_users: 0, banned_users: 0, new_users_week: 0 }] })),

      // Posts count
      pool.query(`
        SELECT 
          COUNT(*)::int AS total_posts,
          COUNT(*) FILTER (WHERE is_deleted = 0)::int AS active_posts,
          COUNT(*) FILTER (WHERE is_deleted = 1)::int AS deleted_posts,
          COUNT(*) FILTER (WHERE post_type = 'content')::int AS content_posts,
          COUNT(*) FILTER (WHERE post_type = 'confession')::int AS confession_posts,
          COUNT(*) FILTER (WHERE post_type = 'question')::int AS question_posts
        FROM posts
      `).catch(() => ({ rows: [{ total_posts: 0, active_posts: 0, deleted_posts: 0, content_posts: 0, confession_posts: 0, question_posts: 0 }] })),

      // Blogs count & pending count
      pool.query(`
        SELECT 
          COUNT(*)::int AS total_blogs,
          COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_blogs,
          COUNT(*) FILTER (WHERE status = 'published')::int AS published_blogs,
          COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected_blogs,
          COUNT(*) FILTER (WHERE status = 'draft')::int AS draft_blogs
        FROM blogs
      `).catch(() => ({ rows: [{ total_blogs: 0, pending_blogs: 0, published_blogs: 0, rejected_blogs: 0, draft_blogs: 0 }] })),

      // Gifs count
      pool.query(`SELECT COUNT(*)::int AS total_gifs FROM gifs`)
        .catch(() => ({ rows: [{ total_gifs: 0 }] })),

      // Events count
      pool.query(`
        SELECT 
          COUNT(*)::int AS total_events,
          COUNT(*) FILTER (WHERE status = 'upcoming')::int AS upcoming_events
        FROM events
      `).catch(() => ({ rows: [{ total_events: 0, upcoming_events: 0 }] })),

      // Reports count
      pool.query(`SELECT COUNT(*)::int AS total_reports FROM reports`)
        .catch(() => ({ rows: [{ total_reports: 0 }] })),

      // Recent pending blogs
      pool.query(`
        SELECT b.id, b.title, b.status, b.created_at, u.username as author
        FROM blogs b
        LEFT JOIN users u ON u.id = b.author_id
        WHERE b.status = 'pending'
        ORDER BY b.created_at DESC
        LIMIT 5
      `).catch(() => ({ rows: [] })),

      // Recent users
      pool.query(`
        SELECT id, username, email, created_at, role, is_banned
        FROM users
        ORDER BY created_at DESC
        LIMIT 5
      `).catch(() => ({ rows: [] }))
    ]);

    return res.json({
      stats: {
        users: userStats.rows[0],
        posts: postStats.rows[0],
        blogs: blogStats.rows[0],
        gifs: gifStats.rows[0],
        events: eventStats.rows[0],
        reports: reportStats.rows[0],
      },
      pendingBlogs: recentBlogs.rows,
      recentUsers: recentUsers.rows,
    });
  } catch (err) {
    console.error("[getDashboardStats]", err);
    return res.status(500).json({ message: "Failed to load dashboard metrics" });
  }
};

// ----------------------------------------------------
// USER MANAGEMENT
// ----------------------------------------------------
const getUsers = async (req, res) => {
  try {
    await ensureSchema();
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const offset = (page - 1) * limit;
    const { search, filter } = req.query;

    const values = [];
    const filters = ["1=1"];

    if (search) {
      values.push(`%${search.trim().toLowerCase()}%`);
      filters.push(`(lower(u.username) LIKE $${values.length} OR lower(u.email) LIKE $${values.length} OR lower(u.nickname) LIKE $${values.length})`);
    }

    if (filter === "banned") {
      filters.push("u.is_banned = true");
    } else if (filter === "active") {
      filters.push("(u.is_banned = false OR u.is_banned IS NULL)");
    } else if (filter === "admin") {
      filters.push("u.role = 'admin'");
    }

    const whereSql = filters.join(" AND ");

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM users u WHERE ${whereSql}`,
      values
    );

    values.push(limit, offset);
    const usersRes = await pool.query(
      `SELECT 
        u.id, u.username, u.email, u.nickname, u.avatar_url, u.profession, 
        u.work_place, u.bio, u.created_at, u.role, u.is_banned,
        (SELECT COUNT(*)::int FROM posts p WHERE p.user_id = u.id AND p.is_deleted = 0) AS post_count,
        (SELECT reason FROM user_bans ub WHERE ub.user_id = u.id ORDER BY banned_at DESC LIMIT 1) AS ban_reason
       FROM users u
       WHERE ${whereSql}
       ORDER BY u.created_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    return res.json({
      data: usersRes.rows,
      pagination: {
        page,
        limit,
        total: countRes.rows[0].total,
        totalPages: Math.ceil(countRes.rows[0].total / limit),
      },
    });
  } catch (err) {
    console.error("[getUsers]", err);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const userRes = await pool.query(
      `SELECT id, username, email, nickname, avatar_url, banner_url, profession, 
              work_place, bio, created_at, role, is_banned, followers_count, following_count
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const [postsRes, bansRes] = await Promise.all([
      pool.query(
        "SELECT id, post_type, content_title, question_title, confession_title, created_at, is_deleted FROM posts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10",
        [userId]
      ),
      pool.query(
        "SELECT id, reason, status, banned_at, reviewed_at FROM user_bans WHERE user_id = $1 ORDER BY banned_at DESC",
        [userId]
      ).catch(() => ({ rows: [] }))
    ]);

    return res.json({
      user: userRes.rows[0],
      posts: postsRes.rows,
      bans: bansRes.rows,
    });
  } catch (err) {
    console.error("[getUserById]", err);
    return res.status(500).json({ message: "Failed to fetch user details" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, nickname, bio, profession, work_place, role } = req.body;

    const fields = [];
    const values = [];

    if (username !== undefined) {
      values.push(username.trim());
      fields.push(`username = $${values.length}`);
    }
    if (email !== undefined) {
      values.push(email.trim().toLowerCase());
      fields.push(`email = $${values.length}`);
    }
    if (nickname !== undefined) {
      values.push(nickname.trim());
      fields.push(`nickname = $${values.length}`);
    }
    if (bio !== undefined) {
      values.push(bio);
      fields.push(`bio = $${values.length}`);
    }
    if (profession !== undefined) {
      values.push(profession);
      fields.push(`profession = $${values.length}`);
    }
    if (work_place !== undefined) {
      values.push(work_place);
      fields.push(`work_place = $${values.length}`);
    }
    if (role !== undefined) {
      values.push(role);
      fields.push(`role = $${values.length}`);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "No fields provided to update" });
    }

    values.push(userId);
    const result = await pool.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING id, username, email, nickname, role, bio, profession`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User updated successfully", user: result.rows[0] });
  } catch (err) {
    console.error("[updateUser]", err);
    return res.status(500).json({ message: "Failed to update user" });
  }
};

const banUser = async (req, res) => {
  try {
    await ensureSchema();
    const { userId } = req.params;
    const { reason = "Violation of platform policies" } = req.body;
    const adminId = req.user?.userId || 1;

    // Update user row
    await pool.query("UPDATE users SET is_banned = true WHERE id = $1", [userId]);

    // Insert ban record
    await pool.query(
      `INSERT INTO user_bans (user_id, banned_by, reason, status, banned_at)
       VALUES ($1, $2, $3, 'banned', NOW())`,
      [userId, adminId, reason]
    );

    return res.json({ message: "User has been banned successfully", userId });
  } catch (err) {
    console.error("[banUser]", err);
    return res.status(500).json({ message: "Failed to ban user" });
  }
};

const unbanUser = async (req, res) => {
  try {
    await ensureSchema();
    const { userId } = req.params;

    // Update user row
    await pool.query("UPDATE users SET is_banned = false WHERE id = $1", [userId]);

    // Update ban records
    await pool.query(
      `UPDATE user_bans SET status = 'allow', reviewed_at = NOW() WHERE user_id = $1`,
      [userId]
    );

    return res.json({ message: "User has been unbanned successfully", userId });
  } catch (err) {
    console.error("[unbanUser]", err);
    return res.status(500).json({ message: "Failed to unban user" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    return res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("[deleteUser]", err);
    return res.status(500).json({ message: "Failed to delete user" });
  }
};

// ----------------------------------------------------
// POST MANAGEMENT
// ----------------------------------------------------
const getPostsAdmin = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const offset = (page - 1) * limit;
    const { search, type, status } = req.query;

    const values = [];
    const filters = ["1=1"];

    if (search) {
      values.push(`%${search.trim()}%`);
      filters.push(`(p.content_title ILIKE $${values.length} OR p.text_body ILIKE $${values.length} OR p.question_title ILIKE $${values.length} OR p.confession_title ILIKE $${values.length})`);
    }

    if (type && type !== "all") {
      values.push(type);
      filters.push(`p.post_type = $${values.length}`);
    }

    if (status === "deleted") {
      filters.push("p.is_deleted = 1");
    } else if (status === "active") {
      filters.push("p.is_deleted = 0");
    }

    const whereSql = filters.join(" AND ");

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM posts p WHERE ${whereSql}`,
      values
    );

    values.push(limit, offset);
    const postsRes = await pool.query(
      `SELECT 
        p.id, p.user_id, p.post_type, p.tags, p.created_at, p.is_deleted,
        p.content_title, p.text_body, p.confession_title, p.question_title,
        u.username, u.avatar_url,
        (SELECT COUNT(*)::int FROM comments c WHERE c.post_id = p.id) as comments_count,
        (SELECT COUNT(*)::int FROM post_likes pl WHERE pl.post_id = p.id) as likes_count
       FROM posts p
       LEFT JOIN users u ON u.id = p.user_id
       WHERE ${whereSql}
       ORDER BY p.created_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    return res.json({
      data: postsRes.rows,
      pagination: {
        page,
        limit,
        total: countRes.rows[0].total,
        totalPages: Math.ceil(countRes.rows[0].total / limit),
      },
    });
  } catch (err) {
    console.error("[getPostsAdmin]", err);
    return res.status(500).json({ message: "Failed to fetch posts" });
  }
};

const deletePostAdmin = async (req, res) => {
  try {
    const { postId } = req.params;
    const { permanent } = req.query;

    if (permanent === "true") {
      await pool.query("DELETE FROM posts WHERE id = $1", [postId]);
      return res.json({ message: "Post permanently deleted" });
    }

    await pool.query("UPDATE posts SET is_deleted = 1 WHERE id = $1", [postId]);
    return res.json({ message: "Post soft-deleted successfully" });
  } catch (err) {
    console.error("[deletePostAdmin]", err);
    return res.status(500).json({ message: "Failed to delete post" });
  }
};

const restorePostAdmin = async (req, res) => {
  try {
    const { postId } = req.params;
    await pool.query("UPDATE posts SET is_deleted = 0 WHERE id = $1", [postId]);
    return res.json({ message: "Post restored successfully" });
  } catch (err) {
    console.error("[restorePostAdmin]", err);
    return res.status(500).json({ message: "Failed to restore post" });
  }
};

// ----------------------------------------------------
// GIF MANAGEMENT
// ----------------------------------------------------
const getGifsAdmin = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 24, 1), 100);
    const offset = (page - 1) * limit;
    const { search, category } = req.query;

    const values = [];
    const filters = ["1=1"];

    if (search) {
      values.push(`%${search.trim()}%`);
      filters.push(`(gif_name ILIKE $${values.length} OR gif_label ILIKE $${values.length})`);
    }

    if (category && category !== "all") {
      values.push(category);
      filters.push(`gif_type = $${values.length}`);
    }

    const whereSql = filters.join(" AND ");

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM gifs WHERE ${whereSql}`,
      values
    );

    values.push(limit, offset);
    const result = await pool.query(
      `SELECT * FROM gifs WHERE ${whereSql} ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    return res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total: countRes.rows[0].total,
        totalPages: Math.ceil(countRes.rows[0].total / limit),
      },
    });
  } catch (err) {
    console.error("[getGifsAdmin]", err);
    return res.status(500).json({ message: "Failed to fetch gifs" });
  }
};

const createGifAdmin = async (req, res) => {
  try {
    const { gif_name, gif_label, gif_url, gif_type = "reaction" } = req.body;

    if (!gif_url) {
      return res.status(400).json({ message: "gif_url is required" });
    }

    const result = await pool.query(
      `INSERT INTO gifs (gif_name, gif_label, gif_url, gif_type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [gif_name || "Untitled GIF", gif_label || "trending", gif_url, gif_type]
    );

    try {
      if (cachePost && cachePost.del) await cachePost.del("gifs:page:1");
    } catch (_) {}

    return res.status(201).json({ message: "GIF added successfully", gif: result.rows[0] });
  } catch (err) {
    console.error("[createGifAdmin]", err);
    return res.status(500).json({ message: "Failed to create gif" });
  }
};

const updateGifAdmin = async (req, res) => {
  try {
    const { gifId } = req.params;
    const { gif_name, gif_label, gif_url, gif_type } = req.body;

    const fields = [];
    const values = [];

    if (gif_name !== undefined) {
      values.push(gif_name);
      fields.push(`gif_name = $${values.length}`);
    }
    if (gif_label !== undefined) {
      values.push(gif_label);
      fields.push(`gif_label = $${values.length}`);
    }
    if (gif_url !== undefined) {
      values.push(gif_url);
      fields.push(`gif_url = $${values.length}`);
    }
    if (gif_type !== undefined) {
      values.push(gif_type);
      fields.push(`gif_type = $${values.length}`);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    values.push(gifId);
    const result = await pool.query(
      `UPDATE gifs SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "GIF not found" });
    }

    try {
      if (cachePost && cachePost.del) await cachePost.del("gifs:page:1");
    } catch (_) {}

    return res.json({ message: "GIF updated successfully", gif: result.rows[0] });
  } catch (err) {
    console.error("[updateGifAdmin]", err);
    return res.status(500).json({ message: "Failed to update gif" });
  }
};

const deleteGifAdmin = async (req, res) => {
  try {
    const { gifId } = req.params;
    await pool.query("DELETE FROM gifs WHERE id = $1", [gifId]);

    try {
      if (cachePost && cachePost.del) await cachePost.del("gifs:page:1");
    } catch (_) {}

    return res.json({ message: "GIF deleted successfully" });
  } catch (err) {
    console.error("[deleteGifAdmin]", err);
    return res.status(500).json({ message: "Failed to delete gif" });
  }
};

// ----------------------------------------------------
// EVENT MANAGEMENT
// ----------------------------------------------------
const getEventsAdmin = async (req, res) => {
  try {
    await ensureSchema();
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const offset = (page - 1) * limit;
    const { search, status, category } = req.query;

    const values = [];
    const filters = ["1=1"];

    if (search) {
      values.push(`%${search.trim()}%`);
      filters.push(`(title ILIKE $${values.length} OR location ILIKE $${values.length} OR description ILIKE $${values.length})`);
    }

    if (status && status !== "all") {
      values.push(status);
      filters.push(`status = $${values.length}`);
    }

    if (category && category !== "all") {
      values.push(category);
      filters.push(`category = $${values.length}`);
    }

    const whereSql = filters.join(" AND ");

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM events WHERE ${whereSql}`,
      values
    );

    values.push(limit, offset);
    const result = await pool.query(
      `SELECT * FROM events WHERE ${whereSql} ORDER BY event_date ASC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    return res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total: countRes.rows[0].total,
        totalPages: Math.ceil(countRes.rows[0].total / limit),
      },
    });
  } catch (err) {
    console.error("[getEventsAdmin]", err);
    return res.status(500).json({ message: "Failed to fetch events" });
  }
};

const createEventAdmin = async (req, res) => {
  try {
    await ensureSchema();
    const {
      title,
      description,
      location,
      event_date,
      end_date,
      banner_url,
      category = "General",
      capacity = 100,
      status = "upcoming",
    } = req.body;

    if (!title?.trim() || !event_date) {
      return res.status(400).json({ message: "title and event_date are required" });
    }

    const result = await pool.query(
      `INSERT INTO events (title, description, location, event_date, end_date, banner_url, category, capacity, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        title.trim(),
        description || "",
        location || "",
        event_date,
        end_date || null,
        banner_url || null,
        category,
        capacity || 100,
        status,
        req.user?.userId || 1,
      ]
    );

    return res.status(201).json({ message: "Event created successfully", event: result.rows[0] });
  } catch (err) {
    console.error("[createEventAdmin]", err);
    return res.status(500).json({ message: "Failed to create event" });
  }
};

const updateEventAdmin = async (req, res) => {
  try {
    await ensureSchema();
    const { eventId } = req.params;
    const { title, description, location, event_date, end_date, banner_url, category, capacity, status, registered_count } = req.body;

    const fields = [];
    const values = [];

    const allowed = {
      title, description, location, event_date, end_date,
      banner_url, category, capacity, status, registered_count
    };

    Object.entries(allowed).forEach(([k, v]) => {
      if (v !== undefined) {
        values.push(v);
        fields.push(`${k} = $${values.length}`);
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    fields.push("updated_at = NOW()");
    values.push(eventId);

    const result = await pool.query(
      `UPDATE events SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.json({ message: "Event updated successfully", event: result.rows[0] });
  } catch (err) {
    console.error("[updateEventAdmin]", err);
    return res.status(500).json({ message: "Failed to update event" });
  }
};

const deleteEventAdmin = async (req, res) => {
  try {
    const { eventId } = req.params;
    await pool.query("DELETE FROM events WHERE id = $1", [eventId]);
    return res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("[deleteEventAdmin]", err);
    return res.status(500).json({ message: "Failed to delete event" });
  }
};

// ----------------------------------------------------
// BLOG MANAGEMENT & APPROVAL WORKFLOW
// ----------------------------------------------------
const getBlogsAdmin = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const offset = (page - 1) * limit;
    const { search, status, tag } = req.query;

    const values = [];
    const filters = ["1=1"];

    if (search) {
      values.push(`%${search.trim()}%`);
      filters.push(`(b.title ILIKE $${values.length} OR b.description ILIKE $${values.length} OR u.username ILIKE $${values.length})`);
    }

    if (status && status !== "all") {
      values.push(status);
      filters.push(`b.status = $${values.length}`);
    }

    if (tag) {
      values.push(tag.trim());
      filters.push(`$${values.length} = ANY(b.tags)`);
    }

    const whereSql = filters.join(" AND ");

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM blogs b LEFT JOIN users u ON u.id = b.author_id WHERE ${whereSql}`,
      values
    );

    values.push(limit, offset);
    const result = await pool.query(
      `SELECT 
        b.id, b.slug, b.title, b.description, b.body, b.image_url, b.tags, 
        b.read_time, b.status, b.created_at, b.updated_at, b.author_id,
        COALESCE(u.username, 'CamFoundr Contributor') AS author,
        u.avatar_url
       FROM blogs b
       LEFT JOIN users u ON u.id = b.author_id
       WHERE ${whereSql}
       ORDER BY 
         CASE WHEN b.status = 'pending' THEN 0 ELSE 1 END,
         b.created_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    return res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total: countRes.rows[0].total,
        totalPages: Math.ceil(countRes.rows[0].total / limit),
      },
    });
  } catch (err) {
    console.error("[getBlogsAdmin]", err);
    return res.status(500).json({ message: "Failed to fetch blogs" });
  }
};

const getBlogByIdAdmin = async (req, res) => {
  try {
    const { blogId } = req.params;
    const result = await pool.query(
      `SELECT b.*, u.username as author, u.email as author_email, u.avatar_url
       FROM blogs b
       LEFT JOIN users u ON u.id = b.author_id
       WHERE b.id = $1`,
      [blogId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }

    return res.json({ blog: result.rows[0] });
  } catch (err) {
    console.error("[getBlogByIdAdmin]", err);
    return res.status(500).json({ message: "Failed to fetch blog" });
  }
};

const approveBlogAdmin = async (req, res) => {
  try {
    const { blogId } = req.params;
    const result = await pool.query(
      `UPDATE blogs 
       SET status = 'published', updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [blogId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }

    return res.json({
      message: "Blog approved and published successfully!",
      blog: result.rows[0],
    });
  } catch (err) {
    console.error("[approveBlogAdmin]", err);
    return res.status(500).json({ message: "Failed to approve blog" });
  }
};

const rejectBlogAdmin = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { reason = "Content does not meet platform publishing standards" } = req.body;

    const result = await pool.query(
      `UPDATE blogs 
       SET status = 'rejected', updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [blogId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }

    return res.json({
      message: "Blog rejected.",
      reason,
      blog: result.rows[0],
    });
  } catch (err) {
    console.error("[rejectBlogAdmin]", err);
    return res.status(500).json({ message: "Failed to reject blog" });
  }
};

const updateBlogAdmin = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { title, description, body, image_url, read_time, status, tags } = req.body;

    const fields = [];
    const values = [];

    if (title !== undefined) {
      values.push(title.trim());
      fields.push(`title = $${values.length}`);
    }
    if (description !== undefined) {
      values.push(description.trim());
      fields.push(`description = $${values.length}`);
    }
    if (body !== undefined) {
      values.push(body);
      fields.push(`body = $${values.length}`);
    }
    if (image_url !== undefined) {
      values.push(image_url);
      fields.push(`image_url = $${values.length}`);
    }
    if (read_time !== undefined) {
      values.push(read_time);
      fields.push(`read_time = $${values.length}`);
    }
    if (status !== undefined) {
      values.push(status);
      fields.push(`status = $${values.length}`);
    }
    if (tags !== undefined) {
      values.push(Array.isArray(tags) ? tags : []);
      fields.push(`tags = $${values.length}`);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    fields.push("updated_at = NOW()");
    values.push(blogId);

    const result = await pool.query(
      `UPDATE blogs SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }

    return res.json({ message: "Blog updated successfully", blog: result.rows[0] });
  } catch (err) {
    console.error("[updateBlogAdmin]", err);
    return res.status(500).json({ message: "Failed to update blog" });
  }
};

const deleteBlogAdmin = async (req, res) => {
  try {
    const { blogId } = req.params;
    await pool.query("DELETE FROM blogs WHERE id = $1", [blogId]);
    return res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    console.error("[deleteBlogAdmin]", err);
    return res.status(500).json({ message: "Failed to delete blog" });
  }
};

// ----------------------------------------------------
// REPORTS & MODERATION
// ----------------------------------------------------
const getReportsAdmin = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const offset = (page - 1) * limit;

    const countRes = await pool.query("SELECT COUNT(*)::int AS total FROM reports").catch(() => ({ rows: [{ total: 0 }] }));
    const result = await pool.query(`
      SELECT r.*, u.username as reporter_username, p.content_title, p.post_type
      FROM reports r
      LEFT JOIN users u ON u.id = r.reporter_id
      LEFT JOIN posts p ON p.id = r.post_id
      ORDER BY r.id DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]).catch(() => ({ rows: [] }));

    return res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total: countRes.rows[0].total,
        totalPages: Math.ceil(countRes.rows[0].total / limit),
      },
    });
  } catch (err) {
    console.error("[getReportsAdmin]", err);
    return res.status(500).json({ message: "Failed to fetch reports" });
  }
};

const resolveReportAdmin = async (req, res) => {
  try {
    const { reportId } = req.params;
    await pool.query("DELETE FROM reports WHERE id = $1", [reportId]);
    return res.json({ message: "Report resolved and dismissed" });
  } catch (err) {
    console.error("[resolveReportAdmin]", err);
    return res.status(500).json({ message: "Failed to resolve report" });
  }
};

module.exports = {
  adminLogin,
  getAdminMe,
  getDashboardStats,
  // Users
  getUsers,
  getUserById,
  updateUser,
  banUser,
  unbanUser,
  deleteUser,
  // Posts
  getPostsAdmin,
  deletePostAdmin,
  restorePostAdmin,
  // GIFs
  getGifsAdmin,
  createGifAdmin,
  updateGifAdmin,
  deleteGifAdmin,
  // Events
  getEventsAdmin,
  createEventAdmin,
  updateEventAdmin,
  deleteEventAdmin,
  // Blogs
  getBlogsAdmin,
  getBlogByIdAdmin,
  approveBlogAdmin,
  rejectBlogAdmin,
  updateBlogAdmin,
  deleteBlogAdmin,
  // Reports
  getReportsAdmin,
  resolveReportAdmin,
};

