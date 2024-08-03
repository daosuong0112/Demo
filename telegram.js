const { Telegraf } = require('telegraf');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const TELEGRAM_BOT_TOKEN = "7329649292:AAETHcOyU37T8tgPCP3NtkBUeH6RVhKuXf8";

const bot = new Telegraf(TELEGRAM_BOT_TOKEN); // Replace with your bot token
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


bot.start((ctx) => ctx.reply('Welcome!'));
bot.command('GetChatID', (ctx) => {
    ctx.reply(ctx.chat.id);
})
bot.launch();

app.get('/getChatId', async (req, res) => {
    try {
        res.send({ status: 'Message sent' , data: bot.telegram.chatId});
    } catch (error) {
        res.status(500).send({ error: 'Failed to send message' });
    }
})

app.post('/sendMessage', async (req, res) => {
    const {chatId, message} = req.body;
    try {
        await bot.telegram.sendMessage(chatId, message);
        res.send({ status: 'Message sent' });
    } catch (error) {
        res.status(500).send({ error: 'Failed to send message' });
    }
});

app.post('/sendInvoice', async (req, res) => {
    try {
        const {
            title,
            description,
            payload,
            startParameter,
            currency,
            prices
        } = req.body;

        if ( !title || !description || !payload || !currency || !prices) {
            throw new Error('Missing required parameters');
        }

        const data = {
            title: title,
            description: description,
            payload: payload,
            start_parameter: startParameter,
            currency: currency,
            prices: prices
        }

        await bot.telegram.sendInvoice(
            bot.telegram.chatId,
            data
        );

        res.send({ status: 'Invoice sent' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ status: 'Internal Server Error', error: error.message });
    }
});

app.post('/openInvoice', async (req, res) => {
    try {
        const {
            title,
            description,
            payload,
            currency,
            prices
        } = req.body;

        if ( !title || !description || !payload || !currency || !prices) {
            throw new Error('Missing required parameters');
        }

        const data = {
            title: title,
            description: description,
            payload: payload,
            currency: currency,
            prices: prices
        }

        const msg = await bot.telegram.createInvoiceLink(data);
        console.log("Invoice sent");

        res.send({ status: 'Invoice sent', data: msg });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ status: 'Internal Server Error', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
