import React,{useRef, useEffect} from 'react'
import CopyToClipboard from "react-copy-to-clipboard";
import './video.css'

const PeerVideo = (props) => {
    const ref = useRef();
    useEffect(() => {
        props.peer.on("stream", stream => {
            if(stream){
                ref.current.srcObject = stream;
            }
        })
    },[props.peer]);

    return (
        <video playsInline autoPlay ref={ref} alt="User left" />
    );
}

const Video = ({peersVideo, userVideo, roomID}) => {
    return (
        <div>
            <CopyToClipboard text={roomID}>
                <button className='btn btn-primary button-top'><i class="fa-solid fa-copy"></i> Room ID</button>
            </CopyToClipboard>
            <div className='top'>
                <div className='top-wrapper'>
                <video muted ref={userVideo} autoPlay playsInline />
                {
                    peersVideo.map((peer, index) => {
                        return (
                            <PeerVideo key={index} peer={peer} />
                        );
                    })
                }
                </div>
            </div>
        </div> 
    );
}

export default Video