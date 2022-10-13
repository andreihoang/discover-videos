import { isNewUser, createNewUser } from "../../lib/DB/hasura";
import { magicAdmin } from "../../lib/magic";
import { setTokenCookie } from "../../lib/cookies";
var jwt = require("jsonwebtoken");

export default async function login(req, res) {
  if (req.method === "POST") {
    try {
      const auth = req.headers.authorization;
      const didToken = auth ? auth.substr(7) : "";

      const metadata = await magicAdmin.users.getMetadataByToken(didToken);

      // create jwt token
      const token = jwt.sign(
        {
          ...metadata,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000 + 7 * 24 * 60 * 60),
          "https://hasura.io/jwt/claims": {
            "x-hasura-allowed-roles": ["user", "admin"],
            "x-hasura-default-role": "user",
            "x-hasura-user-id": `${metadata.issuer}`,
          },
        },
        process.env.JWT_SECRET
      );

      // check if user exists
      const isNewUserQuery = await isNewUser(token, metadata.issuer);
      isNewUserQuery && (await createNewUser(token, metadata));
      setTokenCookie(token, res);
      res.send({ done: true });
    } catch (err) {
      console.log("Error for jwt token: ", err);
      res.status(500).send({ done: false });
    }
  } else {
    res.send({ done: "Not post method" });
  }
}
