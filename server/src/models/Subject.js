const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Subject name is required'],
        trim: true,
        maxlength: [100, 'Subject name cannot exceed 100 characters']
    },
    color: {
        type: String,
        default: '#6366f1', // Default indigo color
        match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color']
    },
    icon: {
        type: String,
        default: '📚'
    }
}, {
    timestamps: true
});

// Compound index to ensure unique subject names per user
subjectSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);
