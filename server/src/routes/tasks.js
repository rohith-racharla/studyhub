const express = require('express');
const Task = require('../models/Task');
const Subject = require('../models/Subject');

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all tasks for current user (with filtering options)
// @access  Private
router.get('/', async (req, res, next) => {
    try {
        const query = { user: req.userId };

        // Filter by subject
        if (req.query.subject) {
            query.subject = req.query.subject;
        }

        // Filter by completion status
        if (req.query.completed === 'true') {
            query.isCompleted = true;
        } else if (req.query.completed === 'false') {
            query.isCompleted = false;
        }

        // Filter by priority
        if (req.query.priority) {
            query.priority = req.query.priority;
        }

        // Build sort option
        let sort = { createdAt: -1 };
        if (req.query.sort === 'dueDate') {
            sort = { dueDate: 1, createdAt: -1 };
        } else if (req.query.sort === 'priority') {
            // Custom sort for priority (high > medium > low)
            sort = { priority: -1, createdAt: -1 };
        }

        const tasks = await Task.find(query)
            .populate('subject', 'name color icon')
            .sort(sort);

        res.json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/tasks/upcoming
// @desc    Get upcoming tasks (due in next 7 days)
// @access  Private
router.get('/upcoming', async (req, res, next) => {
    try {
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);

        const tasks = await Task.find({
            user: req.userId,
            isCompleted: false,
            dueDate: { $gte: now, $lte: nextWeek }
        })
            .populate('subject', 'name color icon')
            .sort({ dueDate: 1 });

        res.json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/tasks/stats
// @desc    Get task statistics
// @access  Private
router.get('/stats', async (req, res, next) => {
    try {
        const [total, completed, pending, overdue] = await Promise.all([
            Task.countDocuments({ user: req.userId }),
            Task.countDocuments({ user: req.userId, isCompleted: true }),
            Task.countDocuments({ user: req.userId, isCompleted: false }),
            Task.countDocuments({
                user: req.userId,
                isCompleted: false,
                dueDate: { $lt: new Date() }
            })
        ]);

        res.json({
            success: true,
            data: {
                total,
                completed,
                pending,
                overdue
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/tasks/:id
// @desc    Get single task by ID
// @access  Private
router.get('/:id', async (req, res, next) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            user: req.userId
        }).populate('subject', 'name color icon');

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found.'
            });
        }

        res.json({
            success: true,
            data: task
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', async (req, res, next) => {
    try {
        const { subject, title, description, dueDate, priority } = req.body;

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

        const task = await Task.create({
            user: req.userId,
            subject,
            title,
            description,
            dueDate,
            priority
        });

        await task.populate('subject', 'name color icon');

        res.status(201).json({
            success: true,
            data: task
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', async (req, res, next) => {
    try {
        const { subject, title, description, dueDate, priority, isCompleted } = req.body;

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

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            { subject, title, description, dueDate, priority, isCompleted },
            { new: true, runValidators: true }
        ).populate('subject', 'name color icon');

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found.'
            });
        }

        res.json({
            success: true,
            data: task
        });
    } catch (error) {
        next(error);
    }
});

// @route   PATCH /api/tasks/:id/toggle
// @desc    Toggle task completion status
// @access  Private
router.patch('/:id/toggle', async (req, res, next) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found.'
            });
        }

        task.isCompleted = !task.isCompleted;
        await task.save();
        await task.populate('subject', 'name color icon');

        res.json({
            success: true,
            data: task
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', async (req, res, next) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found.'
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
