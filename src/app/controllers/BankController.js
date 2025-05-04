const Bank = require('../models/Bank');

class BankController {

    // [GET] /bank/bank-list
    async getBankList(req, res) {
        try {
            const bankList = await Bank.find().select('bankName')
            return res.status(200).json(bankList);
        } catch (error) {
            return res.status(500).json({message: 'Internal Server Error'});
        }
    }

    // [POST] /bank/create-bank
    async createBank(req, res) {
        try {
            const {bankName} = req.body;
            const newBank = await Bank.create({bankName});
            return res.status(201).json(newBank);
        } catch (error) {
            console.error(error);
            if (error.code === 11000) {
                return res.status(400).json({message: 'Bank already exists'});
            }
            return res.status(500).json({message: 'Internal Server Error'});
        }
    }

    // async getBankById(req, res) {
    //     try {
    //         const bank = await req.context.models.Bank.findByPk(req.params.id);
    //         if (!bank) {
    //             return res.status(404).json({message: 'Bank not found'});
    //         }
    //         return res.status(200).json(bank);
    //     } catch (error) {
    //         return res.status(500).json({message: 'Internal Server Error'});
    //     }
    // }
}

module.exports = new BankController();