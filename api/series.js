const express = require('express');
const errorHandler = require('errorhandler');
const sqlite3 = require('sqlite3');
const path = require('path');
const issues = require('./issues');

const db = new sqlite3.Database(process.env.TEST_DATABASE || path.join(__dirname, '..', 'database.sqlite'));
// const db = new sqlite3.Database(path.join(__dirname, '..', 'database.sqlite'));
const series = express.Router();

series.get('/', (req, res, next) => {
    db.all('SELECT * FROM Series', (error, rows) => {
        if (error) {
            console.log("ERROR FOR SERIES");
            console.log(error);
            next(error);
        }
        console.log(rows);
        res.send({series: rows});
    })
})

series.post('/', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;
    if (!name || !description) {
        res.status(400).send();
    }
    const sql = 'INSERT INTO Series (name, description) VALUES ($name, $description)';
    const values = {
        $name: name,
        $description: description
    }
    db.run(sql, values, function(error) {
        if (error) {
            next(error)
        }
        db.get('SELECT * FROM Series WHERE Series.id = $id', {$id: this.lastID}, (err, series) => {
            if (err) {
                next(err)
            }
            res.status(201).send({series: series});
        })
    })
})

series.param('seriesId', (req, res, next, id) => {
    db.get('SELECT * FROM Series WHERE Series.id = $id', {$id: id}, (error, series) => {
        if (error) {
            next(error);
        } else if (series) {
            req.series = series;
            next();
        } else {
            res.status(404).send();
        }
    })
})

series.get('/:seriesId', (req, res, next) => {
    res.send({series: req.series});
})

series.put('/:seriesId', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;
    if (!name || !description) {
        res.status(400).send();
    }
    const sql = 'UPDATE Series SET name = $name, description = $description WHERE Series.id = $id';
    const values = {
        $name: name,
        $description: description,
        $id: req.series.id
    };
    db.run(sql, values, function(error) {
        if (error) {
            next(error)
        }
        db.get('SELECT * FROM Series WHERE Series.id = $id', {$id: req.series.id}, (err, series) => {
            if (err) {
                next(err)
            }
            res.send({series: series});
        })
    })
})

// series.delete('/:seriesId', (req, res, next) => {

// })

series.use('/:seriesId/issues', issues);

series.use(errorHandler());

module.exports = series;