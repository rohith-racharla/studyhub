const express = require('express');
const Note = require('../models/Note');
const Subject = require('../models/Subject');

const router = express.Router();

// @route   GET /api/notes
// @desc    Get all notes for current user (optionally filter by subject)
// @access  Private
router.get('/', async (req, res, next) => {
    try {
        const query = { user: req.userId };

        // Filter by subject if provided
        if (req.query.subject) {
            query.subject = req.query.subject;
        }

        // Search by title or content
        if (req.query.search) {
            query.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { content: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const notes = await Note.find(query)
            .populate('subject', 'name color icon')
            .sort({ updatedAt: -1 });

        res.json({
            success: true,
            count: notes.length,
            data: notes
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/notes/:id
// @desc    Get single note by ID
// @access  Private
router.get('/:id', async (req, res, next) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            user: req.userId
        }).populate('subject', 'name color icon');

        if (!note) {
            return res.status(404).json({
                success: false,
                error: 'Note not found.'
            });
        }

        res.json({
            success: true,
            data: note
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/notes
// @desc    Create a new note
// @access  Private
router.post('/', async (req, res, next) => {
    try {
        const { subject, title, content } = req.body;

        // Verify subject belongs to user
        const subjectExists = await Subject.findOne({
            _id: subject,
            user: req.userId
        });

        if (!subjectExists) {
            return res.status(400).json({
                success: false,
                error: 'Invalid subject.'
            });
        }

        const note = await Note.create({
            user: req.userId,
            subject,
            title,
            content
        });

        await note.populate('subject', 'name color icon');

        res.status(201).json({
            success: true,
            data: note
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/notes/:id
// @desc    Update a note
// @access  Private
router.put('/:id', async (req, res, next) => {
    try {
        const { subject, title, content } = req.body;

        // If changing subject, verify it belongs to user
        if (subject) {
            const subjectExists = await Subject.findOne({
                _id: subject,
                user: req.userId
            });

            if (!subjectExists) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid subject.'
                });
            }
        }

        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            { subject, title, content },
            { new: true, runValidators: true }
        ).populate('subject', 'name color icon');

        if (!note) {
            return res.status(404).json({
                success: false,
                error: 'Note not found.'
            });
        }

        res.json({
            success: true,
            data: note
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
// @access  Private
router.delete('/:id', async (req, res, next) => {
    try {
        const note = await Note.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                error: 'Note not found.'
            });
        }

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
