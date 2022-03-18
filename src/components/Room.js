import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import Video from './Video';
import './video.css'

let myStream;

const Room = (props) => {
    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const userVideo = useRef();
    let peersRef = useRef([]);
    const [camera, setCamera] = useState(true);
    const [mic, setMic] = useState(true);

    const roomID = props.match.params.roomID;
    useEffect(() => {
        socketRef.current = io.connect("https://see-you-webrtc.herokuapp.com/"); //connection to server at port 8000;

        //Permission to use camera and microphone
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            myStream = stream;  //saving your stream
            userVideo.current.srcObject = stream;

            //send connection to server to join room
            socketRef.current.emit("join room", roomID);

            //Return all the present users from the server in the room when you join a room
            socketRef.current.on("all users", users => {
                const peers = [];
                users.forEach(userID => {
                    const peer = createPeer(userID, socketRef.current.id, stream);
                    peersRef.current.push({
                        peerID: userID,
                        peer,
                        stream,
                    })
                    peers.push(peer);
                })
                setPeers(peers);
                console.log(peers);
            });

            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });

            socketRef.current.on("user joined", payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                    stream,
                })

                setPeers(users => [...users, peer]);
                console.log(peers);
            });

        })
    },[roomID]);




    //getting data for all the existing peers to the the array when you join the room
    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            id: callerID,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
        });

        return peer;
    }

    //gettign data of the new connection who just joined the room
    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            id: callerID,
            stream,
        })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }

    //leaving the room 
    const leaveCall = () => {
        let answer = window.confirm("Are you sure you want to leave this call?");
        if(answer)
        {
            window.location.href = "/";
        }
    };

    //camera control for the video of the user
    const cameraControl = () => {
        const videoTrack = myStream.getTracks().find(track => track.kind === 'video'); // checking for the video stream
        if (videoTrack.enabled) {
            videoTrack.enabled = false;
            setCamera(false);//Show Camera Icon
        } else {
            videoTrack.enabled = true;
            setCamera(true);//Hide Camera Icon
        }
    }

     //audio control for the audio of the user
     const audioControl = () => {
        const audioTrack = myStream.getTracks().find(track => track.kind === 'audio'); // checking for your audio stream
        if (audioTrack.enabled) {
            audioTrack.enabled = false;
            setMic(false);//Mute icon
        } else {
            audioTrack.enabled = true;
            setMic(true);//Unmute icon
        }
    }

    return (
        <div className="room">
            <Video peersVideo={peers} userVideo={userVideo} roomID={roomID} />
            <div className='bottom'>
                <button className='btn btn-danger button-down' onClick={leaveCall}><i class="fa-solid fa-phone-slash"></i></button>
                {
                    camera?
                    (
                        <button className='btn btn-success button-down' onClick={cameraControl}><i class="fa-solid fa-video"></i></button>
                    )
                    :
                    (
                        <button className='btn btn-success button-down' onClick={cameraControl}><i class="fa-solid fa-video-slash"></i></button>
                    )
                }
                {
                    mic?
                    (
                        <button className='btn btn-dark button-down' onClick={audioControl}><i class="fas fa-microphone"></i></button>
                    )
                    :
                    (
                        <button className='btn btn-dark button-down' onClick={audioControl}><i class="fas fa-microphone-slash"></i></button>
                    )
                }
            </div>
        </div>
    );
};

export default Room;
