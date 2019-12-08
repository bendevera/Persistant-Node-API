const express = require('express');
const sqlite3 = require('sqlite3');
const errorHandler = require('errorhandler')
const path = require('path');

const db = new sqlite3.Database(process.env.TEST_DATABASE || path.join(__dirname, '..', 'database.sqlite'));
// const db = new sqlite3.Database(path.join(__dirname, '..', 'database.sqlite'));
const artists = express.Router();

artists.get('/', (req, res, next) => {
    db.all('SELECT * FROM Artist WHERE is_currently_employed = 1', (error, rows) => {
        if (error) {
            console.log("ERROR FOR ATISTS");
            console.log(error);
            next(error);
        } else {
            console.log(rows);
            res.send({artists: rows});
        }
    })
})

artists.post('/', (req, res, next) => {
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    if (!name || !dateOfBirth || !biography) {
        return res.status(400).send();
    }
    const isCurrentlyEmployed = req.body.isCurrentlyEmployed === 0 ? 0 : 1;
    const sql = 'INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)';
    const values = {
    $name: name,
    $dateOfBirth: dateOfBirth,
    $biography: biography,
    $isCurrentlyEmployed: isCurrentlyEmployed
    };
    db.run(sql, values, function(error) {
            if (error) {
                next(error);
            } else {
                db.get(`SELECT * FROM Artist WHERE Artist.id = $id`, {$id: this.lastID}, (err, artist) => {
                    if (err) {
                        next(err);
                    }
                    res.status(201).send({artist: artist});
                })
            }
    }) 
})

artists.param('artistId', (req, res, next, id) => {
    db.get('SELECT * FROM Artist WHERE id=$id', {$id: id}, (error, row) => {
        if (error) {
            next(error);
        } else if (row) {
            req.artist = row;
            next();
        } else {
            res.status(404).send();
        }
    })
})

artists.get('/:artistId', (req, res, next) => {
    res.send({ artist: req.artist });
})

artists.put('/:artistId', (req, res, next) => {
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    if (!name || !dateOfBirth || !biography) {
        return res.status(400).send();
    }
    const isCurrentlyEmployed = req.body.isCurrentlyEmployed === 0 ? 0 : 1;
    const sql = 'UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed WHERE Artist.id = $id';
    const values = {
        $name: name,
        $dateOfBirth: dateOfBirth,
        $biography: biography,
        $isCurrentlyEmployed: isCurrentlyEmployed,
        $id: req.artist.id
    };
    db.run(sql, values, function(error) {
        if (error) {
            next(error);
        }
        db.get('SELECT * FROM Artist WHERE Artist.id = $id', {$id: req.artist.id}, (err, artist) => {
            if (err) {
                next(err);
            }
            res.send({artist: artist});
        })
    })
})

artists.delete('/:artistId', (req,res, next) => {
    db.run('UPDATE Artist SET is_currently_employed = 0 WHERE Artist.id = $id', {$id: req.artist.id}, function(error) {
        if (error) {
            next(error);
        }
        db.get('SELECT * FROM Artist WHERE Artist.id = $id', {$id: req.artist.id}, (err, artist) => {
            if (err) {
                next(err)
            }
            res.send({artist: artist});
        })
    })
})

artists.use(errorHandler());


module.exports = artists;