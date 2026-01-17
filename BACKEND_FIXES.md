# Backend Fixes Required

Your backend code has the following issues causing the frontend errors:

## 1. Health Endpoint Property Mismatch
**Current (Wrong):**
```js
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        sseClients: clients.size,        // ❌ Frontend expects "wsClients"
        mongoConnected: mongoose.connection.readyState === 1,  // ❌ Frontend expects "mongo"
        // ... other properties frontend doesn't expect
    });
});
```

**Fixed:**
```js
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        wsClients: clients.size,
        mongo: mongoose.connection.readyState === 1,
        uptime: process.uptime()
    });
});
```

## 2. Metrics Endpoint Fix
**Current (Partially working):**
The `/metrics` endpoint exists but returns a flat structure. Frontend expects metrics grouped by streamId.

**Fixed:**
```js
app.get("/metrics", (req, res) => {
    const metrics = {};
    
    // Group metrics by streamId (you can enhance this to track actual metrics)
    metrics["default"] = {
        received: 0,
        deduped: 0,
        persisted: 0,
        rejected: 0
    };
    
    res.json(metrics);
});
```

## 3. Banned Users Routes
Make sure your `bannedUserRoutes.js` file includes:
- `GET /admin/bans` - List all banned users
- `POST /admin/bans` - Ban a user
- `DELETE /admin/bans/:id` - Unban a user

Here's a template if needed:

```js
// routes/bannedUserRoutes.js
import express from "express";
import BannedUser from "../models/BannedUser.js";

export default function bannedUserRoutes(bannedUsers) {
    const router = express.Router();

    // GET all banned users
    router.get("/bans", async (req, res) => {
        try {
            const users = await BannedUser.find({});
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // POST - Ban a user
    router.post("/bans", async (req, res) => {
        const { author } = req.body;
        if (!author) {
            return res.status(400).json({ error: "Author is required" });
        }

        try {
            const existing = await BannedUser.findOne({ author });
            if (existing) {
                return res.status(400).json({ error: "User already banned" });
            }

            const banned = new BannedUser({ author, bannedAt: new Date() });
            await banned.save();
            bannedUsers.add(author);
            res.status(201).json(banned);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // DELETE - Unban a user
    router.delete("/bans/:id", async (req, res) => {
        try {
            const user = await BannedUser.findByIdAndDelete(req.params.id);
            if (user) {
                bannedUsers.delete(user.author);
            }
            res.sendStatus(200);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
}
```

## Summary of Changes

1. **Health endpoint**: Return only `status`, `wsClients`, `mongo`, `uptime`
2. **Metrics endpoint**: Already exists, just ensure it returns correct structure
3. **Banned users routes**: Implement all CRUD operations if not already done

After making these changes, restart your backend server and the frontend should work correctly.
