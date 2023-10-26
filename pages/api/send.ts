import { NextApiRequest, NextApiResponse } from 'next'
import { send } from '../../lib/mailChain'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { to, subject, content } = JSON.parse(req.body)
    const mail = await send({ to, subject, content })
    if (mail.savedMessageId) {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.status(200).json({ message: 'Message sent' })
    } else {
      res.status(500).json({ statusCode: 500, message: 'Error sending message' })
    }
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: 'Error sending message' })
  }
}

export default handler