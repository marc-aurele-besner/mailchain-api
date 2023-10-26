import { NextApiRequest, NextApiResponse } from 'next'
import { verify } from '../../../lib/mailChain'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).json(await verify(req.query.address as string))
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: 'Error verifying address' })
  }
}

export default handler