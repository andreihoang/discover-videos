import jwt from "jsonwebtoken";
import {
  findVideoIdByUser,
  insertStats,
  updateStats,
} from "../../lib/DB/hasura";
import { verifyToken } from "../../lib/utils";

export default async function stats(req, res) {
  if (req.method === "POST") {
    try {
      const token = req.cookies.token;
      if (!token) {
        res.status(403).send({ Error: "Not found!" });
      } else {
        const { videoId, favorited, watched = true } = req.body;
        if (videoId) {
          // verify a token symmetric
          const userId = await verifyToken(token);
          const findVideo = await findVideoIdByUser(userId, videoId, token);
          const doesStatsExist = findVideo?.length > 0;
          if (doesStatsExist) {
            // update it
            const response = await updateStats(token, {
              watched,
              userId,
              videoId,
              favorited,
            });
            res.send({ data: response });
          } else {
            // add it
            const response = await insertStats(token, {
              watched,
              userId,
              videoId,
              favorited,
            });
            res.send({ data: response });
          }
        }
      }
    } catch (err) {
      res.status(500).send({ done: false, error: err?.message });
    }
  } else {
    try {
      const token = req.cookies.token;
      if (!token) {
        res.status(403).send({ Error: "Not found!" });
      } else {
        const videoId = req.query.videoId;
        if (videoId) {
          // verify a token symmetric
          const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
          const userId = decodedToken.issuer;
          const findVideo = await findVideoIdByUser(userId, videoId, token);

          const doesStatsExist = findVideo?.length > 0;
          if (doesStatsExist) {
            res.send(findVideo);
          } else {
            res.status(404);
            res.send({ user: null, msg: "Video not found!" });
          }
        }
      }
    } catch (err) {
      res.status(500).send({ done: false, error: err?.message });
    }
  }
}
