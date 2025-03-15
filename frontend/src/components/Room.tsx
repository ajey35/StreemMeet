/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Socket, io } from "socket.io-client";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";

const URL = "http://localhost:3000";

export const Room = ({
    name,
    localAudioTrack,
    localVideoTrack
}: {
    name: string,
    localAudioTrack: MediaStreamTrack | null,
    localVideoTrack: MediaStreamTrack | null,
}) => {
    const [searchParams] = useSearchParams();
    const [lobby, setLobby] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [sendingPc, setSendingPc] = useState<RTCPeerConnection | null>(null);
    const [receivingPc, setReceivingPc] = useState<RTCPeerConnection | null>(null);
    const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
    const [isVideoDisabled, setIsVideoDisabled] = useState<boolean>(false);
    const [callDuration, setCallDuration] = useState<number>(0);
    const [isLocalVideoFullscreen, setIsLocalVideoFullscreen] = useState<boolean>(false);

    useEffect(() => {
        const socket = io(URL);
        socket.on('send-offer', async ({ roomId }) => {
            console.log("sending offer");
            setLobby(false);
            const pc = new RTCPeerConnection();

            setSendingPc(pc);
            if (localVideoTrack) {
                console.error("added track");
                console.log(localVideoTrack);
                pc.addTrack(localVideoTrack);
            }
            if (localAudioTrack) {
                console.error("added track");
                console.log(localAudioTrack);
                pc.addTrack(localAudioTrack);
            }

            pc.onicecandidate = async (e) => {
                console.log("receiving ice candidate locally");
                if (e.candidate) {
                    socket.emit("add-ice-candidate", {
                        candidate: e.candidate,
                        type: "sender",
                        roomId
                    });
                }
            };

            pc.onnegotiationneeded = async () => {
                console.log("on negotiation needed, sending offer");
                const sdp = await pc.createOffer();
                await pc.setLocalDescription(sdp);
                socket.emit("offer", {
                    sdp,
                    roomId
                });
            };
        });

        socket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
            console.log("received offer");
            setLobby(false);
            const pc = new RTCPeerConnection();
            await pc.setRemoteDescription(remoteSdp);
            const sdp = await pc.createAnswer();
            await pc.setLocalDescription(sdp);
            const stream = new MediaStream();
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }

            setRemoteMediaStream(stream);
            // trickle ice 
            setReceivingPc(pc);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).pcr = pc;
            pc.ontrack = (e) => {
                alert("ontrack");
                // console.error("inside ontrack");
                // const {track, type} = e;
                // if (type == 'audio') {
                //     // setRemoteAudioTrack(track);
                //     // @ts-ignore
                //     remoteVideoRef.current.srcObject.addTrack(track)
                // } else {
                //     // setRemoteVideoTrack(track);
                //     // @ts-ignore
                //     remoteVideoRef.current.srcObject.addTrack(track)
                // }
                // //@ts-ignore
                // remoteVideoRef.current.play();
            };

            pc.onicecandidate = async (e) => {
                if (!e.candidate) {
                    return;
                }
                console.log("on ice candidate on receiving side");
                if (e.candidate) {
                    socket.emit("add-ice-candidate", {
                        candidate: e.candidate,
                        type: "receiver",
                        roomId
                    });
                }
            };

            socket.emit("answer", {
                roomId,
                sdp: sdp
            });
            setTimeout(() => {
                const track1 = pc.getTransceivers()[0].receiver.track;
                const track2 = pc.getTransceivers()[1].receiver.track;
                console.log(track1);
                if (track1.kind === "video") {
                    setRemoteAudioTrack(track2);
                    setRemoteVideoTrack(track1);
                } else {
                    setRemoteAudioTrack(track1);
                    setRemoteVideoTrack(track2);
                }
                if (remoteVideoRef.current && remoteVideoRef.current.srcObject instanceof MediaStream) {
                    remoteVideoRef.current.srcObject.addTrack(track1);
                    remoteVideoRef.current.srcObject.addTrack(track2);
                    remoteVideoRef.current.play();
                }
            }, 5000);
        });

        socket.on("answer", ({ sdp: remoteSdp }) => {
            setLobby(false);
            setSendingPc(pc => {
                pc?.setRemoteDescription(remoteSdp);
                return pc;
            });
            console.log("loop closed");
        });

        socket.on("lobby", () => {
            setLobby(true);
        });

        socket.on("add-ice-candidate", ({ candidate, type }) => {
            console.log("add ice candidate from remote");
            console.log({ candidate, type });
            if (type == "sender") {
                setReceivingPc(pc => {
                    if (!pc) {
                        console.error("receiving pc not found");
                    } else {
                        console.error(pc.ontrack);
                    }
                    pc?.addIceCandidate(candidate);
                    return pc;
                });
            } else {
                setSendingPc(pc => {
                    if (!pc) {
                        console.error("sending pc not found");
                    } else {
                        // console.error(pc.ontrack)
                    }
                    pc?.addIceCandidate(candidate);
                    return pc;
                });
            }
        });

        setSocket(socket);
        
        // Cleanup function
        return () => {
            socket.disconnect();
        };
    }, [name, localAudioTrack, localVideoTrack]);

    useEffect(() => {
        if (localVideoRef.current && localVideoTrack) {
            const stream = new MediaStream([localVideoTrack]);
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play().catch(err => console.error("Error playing local video:", err));
        }
    }, [localVideoRef, localVideoTrack]);

    // Track call duration
    useEffect(() => {
        const timer = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Control handlers
    const toggleAudio = () => {
        if (localAudioTrack) {
            localAudioTrack.enabled = !localAudioTrack.enabled;
            setIsAudioMuted(!localAudioTrack.enabled);
        }
    };

    const toggleVideo = () => {
        if (localVideoTrack) {
            localVideoTrack.enabled = !localVideoTrack.enabled;
            setIsVideoDisabled(!localVideoTrack.enabled);
        }
    };

    const hangUpCall = () => {
        if (window.confirm('Are you sure you want to end the call?')) {
            sendingPc?.close();
            receivingPc?.close();
            socket?.disconnect();
            window.location.href = '/';
        }
    };

    const toggleFullscreen = () => {
        if (remoteVideoRef.current) {
            if (!document.fullscreenElement) {
                remoteVideoRef.current.requestFullscreen().catch(console.error);
            } else {
                document.exitFullscreen();
            }
        }
    };

    // Format call duration
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            {/* Header */}
            <div className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 py-4 px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Welcome, {name} 
                    </h1>
                    <div className="flex items-center gap-2 text-xs sm:text-sm bg-gray-700 px-2 sm:px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span>Live • {formatDuration(callDuration)}</span>
                    </div>
                </div>
                <div className="text-xs sm:text-sm text-gray-400">
                    Room ID: {searchParams.get("roomId")}
                </div>
            </div>
    
            {/* Main Video Container */}
            <div className="flex-1 relative p-2 sm:p-6">
                {/* Remote Video */}
                <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-6">
                    <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-gray-800 shadow-lg sm:shadow-2xl">
                        <video
                            autoPlay
                            ref={remoteVideoRef}
                            className="w-full h-full object-cover scale-x-[-1]"
                            onClick={toggleFullscreen}
                        />
                    </div>
                </div>
    
                {/* Local Video PIP */}
                <div className={`absolute bottom-2 sm:bottom-6 right-2 sm:right-6 ${
                    isLocalVideoFullscreen ? 
                        'w-full h-full inset-0' : 
                        'w-32 h-24 sm:w-64 sm:h-48'
                    } rounded-lg sm:rounded-xl overflow-hidden bg-gray-800 shadow-lg border border-gray-600 sm:border-2 transition-all duration-300`}>
                    <video
                        autoPlay
                        ref={localVideoRef}
                        className="w-full h-full object-cover scale-x-[-1]"
                        onClick={() => setIsLocalVideoFullscreen(!isLocalVideoFullscreen)}
                    />
                    <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-gray-900/50 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs flex gap-1 sm:gap-2">
                        <button
                            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${isAudioMuted ? 'bg-red-400' : 'bg-green-400'}`}
                            onClick={toggleAudio}
                        />
                        <button
                            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${isVideoDisabled ? 'bg-red-400' : 'bg-green-400'}`}
                            onClick={toggleVideo}
                        />
                        <span className="hidden sm:inline">Your camera</span>
                    </div>
                </div>
            </div>
    
            {/* Controls */}
            <div className="bg-gray-800/80 backdrop-blur-sm border-t border-gray-700 py-3 sm:py-4">
                <div className="flex justify-center gap-2 sm:gap-4">
                    {/* Audio Toggle */}
                    <button
                        className={`p-2 sm:p-3 rounded-full flex items-center transition-all ${
                            isAudioMuted ? 
                                'bg-red-400/20 hover:bg-red-400/30' : 
                                'bg-gray-700 hover:bg-gray-600'
                        }`}
                        onClick={toggleAudio}
                    >
                        {isAudioMuted ? (
                            <MicOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        ) : (
                            <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        )}
                    </button>

                    {/* Hang Up Button */}
                    <button
                        className="p-2 sm:p-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors"
                        onClick={hangUpCall}
                    >
                        <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </button>

                    {/* Video Toggle */}
                    <button
                        className={`p-2 sm:p-3 rounded-full flex items-center transition-all ${
                            isVideoDisabled ? 
                                'bg-red-400/20 hover:bg-red-400/30' : 
                                'bg-gray-700 hover:bg-gray-600'
                        }`}
                        onClick={toggleVideo}
                    >
                        {isVideoDisabled ? (
                            <VideoOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        ) : (
                            <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};