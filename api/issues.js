const express = require('express');
const sqlite3 = require('sqlite3')
const path = require('path');

const db = new sqlite3.Database(process.env.TEST_DATABASE || path.join(__dirname, '..', 'database.sqlite'))

const issuesRouter = express.Router({mergeParams: true});

issuesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Issue WHERE series_id = $id', {$id: req.series.id}, (error, issues) => {
        if (error) {
            next(error);
        }
        res.send({issues: issues});
    })
})

issuesRouter.post('/', (req, res, next) => {
    const name = req.body.issue.name;
    const issueNumber = req.body.issue.issueNumber;
    const publicationDate = req.body.issue.publicationDate;
    const artistId = req.body.issue.artistId;
    if (!name || !issueNumber || !publicationDate || !artistId) {
        res.status(400).send();
    }
    const sql = 'INSERT INTO Issue (name, issue_number, publication_date, series_id, artist_id) VALUES ($name, $issue_number, $publication_date, $series_id, $artist_id )';
    const values = {
        $name: name,
        $issue_number: issueNumber,
        $publication_date: publicationDate,
        $series_id: req.series.id,
        $artist_id: artistId
    }
    db.run(sql, values, function(error) {
        if (error) {
            next(error);
        }
        db.get('SELECT * FROM Issue WHERE id = $id', {$id: this.lastID}, (err, issue) => {
            if(err) {
                next(err);
            }
            res.status(201).send({issue: issue});
        })
    })
})

issuesRouter.param('issueId', (req, res, next, id) => {
    db.get('SELECT * FROM Issue WHERE id=$id', {$id: id}, (error, issue) => {
        if (error) {
            next(error);
        }
        if (issue) {
            req.issue = issue;
            next();
        } else {
            res.status(404).send()
        }
    })
})

issuesRouter.put('/:issueId', (req, res, next) => {
    const name = req.body.issue.name;
    const issueNumber = req.body.issue.issueNumber;
    const publicationDate = req.body.issue.publicationDate;
    const artistId = req.body.issue.artistId;
    if (!name || !issueNumber || !publicationDate || !artistId) {
        res.status(404).send();
    }
    const sql = 'UPDATE Issue SET name = $name, issue_number = $issueNumber, publication_date = $publicationDate, artist_id = $artistId WHERE Issue.id=$id';
    const values = {
        $name: name,
        $issueNumber: issueNumber,
        $publicationDate: publicationDate,
        $artistId: artistId,
        $id: req.issue.id
    }
    db.run(sql, values, function(error) {
        if (error) {
            next(error)
        }
        db.get('SELECT * FROM Issue WHERE id=$id', {$id: this.lastID}, (err, issue) => {
            if (err) {
                next(err)
            }
            res.send({issue: issue});
        })
    })
})

issuesRouter.delete('/:issueId', (req, res, next) => {
    db.run('DELETE FROM Issue WHERE Issue.id=$id', {$id: req.issue.id}, function(error) {
        if (error) {
            next(error)
        }
        res.status(204).send();
    })
})

module.exports = issuesRouter;