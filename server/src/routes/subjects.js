const express = require('express');
const Subject = require('../models/Subject');
const Note = require('../models/Note');
const Task = require('../models/Task');

const router = express.Router();

// @route   GET /api/subjects
// @desc    Get all subjects for current user
// @access  Private
router.get('/', async (req, res, next) => {
    try {
        const subjects = await Subject.find({ user: req.userId })
            .sort({ createdAt: -1 });

        // Get counts for each subject
        const subjectsWithCounts = await Promise.all(
            subjects.map(async (subject) => {
                const noteCount = await Note.countDocuments({
                    user: req.userId,
                    subject: subject._id
                });
                const taskCount = await Task.countDocuments({
                    user: req.userId,
                    subject: subject._id
                });

                return {
                    ...subject.toObject(),
                    noteCount,
                    taskCount
                };
            })
        );

        res.json({
            success: true,
            count: subjects.length,
            data: subjectsWithCounts
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/subjects/:id
// @desc    Get single subject by ID
// @access  Private
router.get('/:id', async (req, res, next) => {
    try {
        const subject = await Subject.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                error: 'Subject not found.'
            });
        }

        res.json({
            success: true,
            data: subject
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/subjects
// @desc    Create a new subject
// @access  Private
router.post('/', async (req, res, next) => {
    try {
        const { name, color, icon } = req.body;

        const subject = await Subject.create({
            user: req.userId,
            name,
            color,
            icon
        });

        res.status(201).json({
            success: true,
            data: subject
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/subjects/:id
// @desc    Update a subject
// @access  Private
router.put('/:id', async (req, res, next) => {
    try {
        const { name, color, icon } = req.body;

        const subject = await Subject.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            { name, color, icon },
            { new: true, runValidators: true }
        );

        if (!subject) {
            return res.status(404).json({
                success: false,
                error: 'Subject not found.'
            });
        }

        res.json({
            success: true,
            data: subject
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/subjects/:id
// @desc    Delete a subject and all its notes/tasks
// @access  Private
router.delete('/:id', async (req, res, next) => {
    try {
        const subject = await Subject.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                error: 'Subject not found.'
            });
        }

        // Delete all associated notes and tasks
        await Note.deleteMany({ subject: req.params.id, user: req.userId });
        await Task.deleteMany({ subject: req.params.id, user: req.userId });

        await subject.deleteOne();

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
