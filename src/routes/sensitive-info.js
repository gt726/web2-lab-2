const express = require("express");
const pool = require("../db/pool");
const bcrypt = require("bcrypt");

const router = express.Router();

// dohvacanje korisnika
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM users ORDER BY created_at DESC`,
        );

        res.render("sensitive-info", {
            users: result.rows,
        });
    } catch (error) {
        console.error("Dogodila se greška pri dohvaćanju korisnika:", error);
        res.status(500).send(
            "Dogodila se greška prilikom dohvaćanja korisnika.",
        );
    }
});

// kreiranje korisnika
router.post("/add", async (req, res) => {
    try {
        const email = req.body.email;
        const rawPassword = req.body.password;
        const vulnerable = req.body.vulnerable === "true";

        if (!email || !email.trim() || !rawPassword || !rawPassword.trim()) {
            return res.redirect("/ranjivosti/sensitive-info");
        }

        let password;

        if (vulnerable) {
            password = rawPassword;
        } else {
            password = await bcrypt.hash(rawPassword, 12);
        }

        await pool.query(
            `INSERT INTO users (email,password)
            VALUES($1, $2)
            RETURNING user_id`,
            [email, password],
        );
        res.redirect("/ranjivosti/sensitive-info");
    } catch (error) {
        console.error("Greška pri stvaranju korisnika:", error);
        res.status(500).send("Došlo je do greške pri stvaranju korisnika.");
    }
});

// brisanje korisnika
router.post("/:id/delete", async (req, res) => {
    try {
        const id = req.params.id;

        const result = await pool.query(
            `DELETE FROM users
            WHERE user_id = $1
            RETURNING user_id`,
            [id],
        );

        if (result.rows.length === 0) {
            return res.status(404).send("Korisnik nije pronađen.");
        }

        res.redirect("/ranjivosti/sensitive-info");
    } catch (error) {
        console.error("Greška prilikom brisanja korisnika:", error);
        res.status(500).send("Dogodila se greška prilikom brisanja korisnika");
    }
});

module.exports = router;
