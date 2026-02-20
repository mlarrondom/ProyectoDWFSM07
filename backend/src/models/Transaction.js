const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
    {
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
            default: null
        },
        buyer: {
            fullName: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
            phone: {
                type: String,
                required: true
            }
        },
        items: [
            {
                certCode: {
                    type: String,
                    required: true
                },
                name: {
                    type: String,
                    required: true
                },
                price: {
                    type: Number,
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                    default: 1
                }
            }
        ],
        amount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        mp: {
            preferenceId: String,
            externalReference: String,
            paymentId: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Transaction', transactionSchema);