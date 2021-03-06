import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify/*, decode */ } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
//import Axios from 'axios'
//import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')



// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
//const jwksUrl = 'https://dev-u23y6q-y.eu.auth0.com/.well-known/jwks.json'

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJSD4wHaUvKKIZMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi11MjN5NnEteS5ldS5hdXRoMC5jb20wHhcNMjAwMTIzMTM1MzM0WhcN
MzMxMDAxMTM1MzM0WjAkMSIwIAYDVQQDExlkZXYtdTIzeTZxLXkuZXUuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAugkIyPkz0WzmuaRI
fwwgtRh7ExG4CfMO1hvQ7ObWDeRWuKm+hiHFkmRu/bHOt4XMCWm2LdDwjEzdXcQ4
W6Qvlj7az0fpNBRnsp9EFTq1//X+T/6gxnac55rI5US/lxV+h1/c/9Tgyr89etFH
BONhS1RB4V6z6qQWHdCrAaslNM249kFKsICxtDdOXaEGi3WWc+dIRuLx/SMFJtTM
LQLaQGPfIjlZcxJUeGFB+XYfqEFCFPHtryXfMrSfWRCFzI2R4D70xsGoR9d3Z1ab
scSel1YDHplUG1eh+VlxUSUSCPBOb0AIXIskB0ni89hlD7M5yJV0ggYdxUsnWhrh
UDlRlQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQVwY4CM/Bo
JNBT8ftN8ths86mQTzAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
ABwQjvuxxs5SjrxertPfquUn6v7UEmnkXN1qNY4EuGvTujdTAOXjdDHTS5n22tqG
kpQMgsje6wmoU5aItMFIGfukcMfVo80ezmyZ5jSILruakk2wc0FU2tjQ8/z/QNdi
VSicWAwwRWn97xBZT3vsT1D81jjynLx+eqPbcFFbuLfw89UxHeuAruDd6OkymAoX
yph2DWUmb4jgvxyR/vVgq7hnVZq379Gu+iH7ALY4f9E1otllKJNGdX7qVD9PUagz
qq/N3UehuX8A5mgt1+anVkosnCHHHnPfzI14e9PbALWT7uZ9mHoU1QRejmyL9Op4
IFPNfr0Oo7KYJWAPg7kGGFE=
-----END CERTIFICATE-----
`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  //const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
