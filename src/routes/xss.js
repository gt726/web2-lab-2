const express = require("express");
const pool = require("../db/pool");

const router = express.Router();

// dohvacanje komentara
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM comments ORDER BY created_at DESC`,
        );

        const vulnerable = req.query.enabled === "true";

        res.render("xss", {
            comments: result.rows,
            vulnerable: vulnerable,
        });
    } catch (error) {
        console.error("Greška prilikom dohvaćanja komentara:", error);
        res.status(500).send("Greška prilikom dohvaćanja komentara");
    }
});

// stvaranje komentara
router.post("/add", async (req, res) => {
    try {
        const komentar = req.body.komentar;

        if (!komentar || !komentar.trim()) {
            return res.redirect(
                req.body.enabled === "true"
                    ? "/ranjivosti/xss?enabled=true"
                    : "/ranjivosti/xss?enabled=false",
            );
        }

        await pool.query(
            `INSERT INTO comments (content)
            VALUES($1)
            RETURNING comment_id`,
            [komentar],
        );
        res.redirect(
            req.body.enabled === "true"
                ? "/ranjivosti/xss?enabled=true"
                : "/ranjivosti/xss?enabled=false",
        );
    } catch (error) {
        console.error("Greška pri spremanju komentara:", error);
        res.status(500).send("Došlo je do greške pri spremanju komentara.");
    }
});

// brisanje komentara
router.post("/:id/delete", async (req, res) => {
    try {
        const id = req.params.id;

        const result = await pool.query(
            `DELETE FROM comments
            WHERE comment_id = $1
            RETURNING comment_id`,
            [id],
        );

        if (result.rows.length === 0) {
            return res.status(404).send("Komentar nije pronađen.");
        }

        res.redirect(
            req.body.enabled === "true"
                ? "/ranjivosti/xss?enabled=true"
                : "/ranjivosti/xss?enabled=false",
        );
    } catch (error) {
        console.error("Greška prilikom brisanja komentara:", error);
        res.status(500).send("Dogodila se greška prilikom brisanja komentara");
    }
});

module.exports = router;
