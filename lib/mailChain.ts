import { resolveAddress } from '@mailchain/sdk/internal'
import { Mailchain, SendMailParams } from '@mailchain/sdk'

export type Resolve = {
	address: string
	message: string
	type?: string
	isRegistered?: boolean
	error?: boolean
}

export type Send = Omit<SendMailParams, 'from'>

export const resolveEthereumAddress = (address: string): string => address + '@ethereum.mailchain.com'

export const verify = async (address: string): Promise<Resolve> => {
	address = resolveEthereumAddress(address)
	const { data, error } = await resolveAddress(address)
	if (error) {
		const { type, message } = error
		console.warn(`ERROR check address - ${address} - ${type} - ${message}`)
        return {
			address: address,
			message: message,
			type: type,
			error: true
		}
	}
	console.log(`${address} is reachable.`)

	if (data.type === 'registered') {
		// Secrets or sensitive information should only be sent to registered users.
		console.log(`${address} registered`);
		return {
			address: address,
			message: 'registered',
			type: data.type,
			isRegistered: true
		}
	} else if (data.type === 'vended') {
		console.log(`${address} not yet registered - still possible to send mail`);
		return {
			address: address,
			message: 'not yet registered',
			type: data.type,
			isRegistered: false
		}
	}
	return {
		address: address,
		message: 'error',
		isRegistered: false,
		error: true
	}
}

export const send = async (params: Send) => {
	const secretRecoveryPhrase = process.env.SECRET_RECOVERY_PHRASE

	if (secretRecoveryPhrase == null) {
		throw new Error('You must provide a secret recovery phrase')
	}
	const mailchain = Mailchain.fromSecretRecoveryPhrase(secretRecoveryPhrase)

	const currentUser = await mailchain.user()
	const to = params.to?.map((to) => resolveEthereumAddress(to))
	const message = {
		...params,
		from: currentUser.address,
		to
	}

	const { data, error } = await mailchain.sendMail(message)
	if (error) {
		throw new Error('MailChain error: ' + error.message)
	}

	return data
}