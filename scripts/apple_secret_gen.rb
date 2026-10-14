# needs to be regenerated every 6 months (next on April 2027)

require "jwt" # gem install jwt https://github.com/jwt/ruby-jwt

key_file = "" # Get from https://developer.apple.com/account/resources/authkeys
team_id = "" # Get from developers apple top right
client_id = "com.suprascribe.www"
key_id = "" # Code part of the keyfile
validity_period = 180 # In days. Max 180 (6 months) according to Apple docs.

private_key = OpenSSL::PKey::EC.new IO.read key_file

token = JWT.encode(
	{
		iss: team_id,
		iat: Time.now.to_i,
		exp: Time.now.to_i + 86400 * validity_period,
		aud: "https://appleid.apple.com",
		sub: client_id
	},
	private_key,
	"ES256",
	header_fields=
	{
		kid: key_id 
	}
)
puts token
