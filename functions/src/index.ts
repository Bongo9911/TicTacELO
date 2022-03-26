import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp({
	projectId: "tictactoeelo",
	storageBucket: "tictactoeelo.appspot.com",
	credential: admin.credential.applicationDefault(),
});

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

export const makeMatch = functions.runWith({ timeoutSeconds: 540, memory: '128MB', maxInstances: 1 })
    .firestore.document('matchmaking/{docId}').onCreate(async (snap, context) => {
        //const data = snap.data() as Match;
        let players = await admin.firestore().collection("matchmaking").where("found", "==", false).get();
        if(players.docs.length >= 2) {
            let id: string = generateID();
            let playerone = players.docs[0].data() as Match;
            let playertwo = players.docs[1].data() as Match;

            admin.firestore().collection("Games").doc(id).set({
                board: ["","","","","","","","",""],
                completed: false,
                gameId: id,
                players: [playerone.user, playertwo.user],
                turn: "X",
                winner: ""
            }).then(() => {
                admin.firestore().collection("matchmaking").doc(players.docs[0].id).set({
                    user: playerone.user,
                    code: id,
                    found: true
                })
                admin.firestore().collection("matchmaking").doc(players.docs[1].id).set({
                    user: playertwo.user,
                    code: id,
                    found: true
                })
            })
            // admin.firestore().collection("matchmaking").doc(players.docs[0].id).delete();
            // admin.firestore().collection("matchmaking").doc(players.docs[1].id).delete();
        }
    });


interface Match {
    user: string,
    code: "",
    found: boolean
}

const generateID = () => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 4; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }