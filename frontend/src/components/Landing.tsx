import { useEffect, useRef, useState } from "react";
import { Room } from "./Room";
import { 
  Mic, MicOff, Video, VideoOff, Loader2, AlertCircle, User,
  Shield, Zap, Users, Globe2,
  Wifi,
  Sparkles
} from "lucide-react";

export const Landing = () => {
    const [name, setName] = useState("");
    const [joined, setJoined] = useState(false);
    const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);

    const getCam = async () => {
        try {
            setIsLoading(true);
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

            if (!stream) throw new Error("No media stream available");

            const audioTrack = stream.getAudioTracks()[0] || null;
            const videoTrack = stream.getVideoTracks()[0] || null;

            if (!videoTrack) throw new Error("No video track found");

            videoTrack.enabled = true;
            setLocalAudioTrack(audioTrack);
            setLocalVideoTrack(videoTrack);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(err => console.error("Video play error:", err));
            }
        } catch (error) {
            console.error("Error accessing media devices:", error);
            setError("Please allow camera and microphone access to continue.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getCam();
    }, []);

    useEffect(() => {
        if (videoRef.current && localVideoTrack) {
            const stream = new MediaStream([localVideoTrack]);
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(err => console.error("Video play error:", err));
        }
    }, [localVideoTrack]);

    const toggleAudio = () => {
        if (localAudioTrack) {
            localAudioTrack.enabled = !audioEnabled;
            setAudioEnabled(!audioEnabled);
        }
    };

    const toggleVideo = () => {
        if (localVideoTrack) {
            localVideoTrack.enabled = !videoEnabled;
            setVideoEnabled(!videoEnabled);
        }
    };

    if (!joined) {
        return (
            <div className="min-h-screen bg-[#0A0118] text-white overflow-hidden relative">
                {/* Animated background gradients */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] -top-48 -left-24 animate-pulse" />
                    <div className="absolute w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] -bottom-48 -right-24 animate-pulse delay-700" />
                    <div className="absolute w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse delay-1000" />
                </div>

                <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 min-h-screen flex flex-col">
                    {/* Header */}
                    <header className="text-center space-y-6 mb-8 md:mb-12">
                        <div className="relative inline-block">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    StreamMeet
                                </span>
                                
                            </h1>
                            <Sparkles className="absolute -top-4 -right-8 w-6 h-6 text-yellow-400 animate-pulse" />
                        </div>
                        <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            Experience the future of video collaboration with 
                            crystal-clear quality
                        </p>
                        
                        {/* Feature badges */}
                        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium">
                            <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-800/50 backdrop-blur rounded-full flex items-center gap-2 hover:bg-gray-700/50 transition-colors">
                                <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                                <span>End-to-End Encrypted</span>
                            </div>
                            <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-800/50 backdrop-blur rounded-full flex items-center gap-2 hover:bg-gray-700/50 transition-colors">
                                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                                <span>Ultra-Low Latency</span>
                            </div>
                            <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-800/50 backdrop-blur rounded-full flex items-center gap-2 hover:bg-gray-700/50 transition-colors">
                                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                                <span>Up to 50 Participants</span>
                            </div>
                            <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-800/50 backdrop-blur rounded-full flex items-center gap-2 hover:bg-gray-700/50 transition-colors">
                                <Globe2 className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                                <span>Global Network</span>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center max-w-6xl mx-auto w-full">
                        {/* Video Preview */}
                        <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-800/50 shadow-2xl group">
                            {isLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative">
                                            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-purple-400" />
                                            <User className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6" />
                                        </div>
                                        <p className="text-sm sm:text-base text-gray-400 animate-pulse">Initializing your devices...</p>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/90 p-4 sm:p-8 text-center">
                                    <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-300 mb-3 sm:mb-4" />
                                    <p className="text-sm sm:text-base text-red-200 mb-4 sm:mb-6">{error}</p>
                                    <button
                                        onClick={getCam}
                                        className="px-4 sm:px-6 py-2 bg-red-500 hover:bg-red-600 rounded-xl transition-colors text-sm sm:text-base"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <video 
                                        ref={videoRef} 
                                        autoPlay 
                                        playsInline 
                                        muted 
                                        className="w-full h-full object-cover transform scale-x-[-1]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                </>
                            )}

                            {/* Camera Controls */}
                            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3">
                                <button 
                                    onClick={toggleAudio}
                                    className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl backdrop-blur-md transition-all flex items-center gap-2 ${
                                        audioEnabled 
                                            ? "bg-gray-800/70 hover:bg-gray-700/70" 
                                            : "bg-red-500/70 hover:bg-red-600/70"
                                    }`}
                                >
                                    {audioEnabled ? <Mic className="w-4 h-4 sm:w-5 sm:h-5" /> : <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />}
                                    <span className="text-xs sm:text-sm hidden md:inline">
                                        {audioEnabled ? "Mute" : "Unmute"}
                                    </span>
                                </button>
                                <button 
                                    onClick={toggleVideo}
                                    className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl backdrop-blur-md transition-all flex items-center gap-2 ${
                                        videoEnabled 
                                            ? "bg-gray-800/70 hover:bg-gray-700/70" 
                                            : "bg-red-500/70 hover:bg-red-600/70"
                                    }`}
                                >
                                    {videoEnabled ? <Video className="w-4 h-4 sm:w-5 sm:h-5" /> : <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" />}
                                    <span className="text-xs sm:text-sm hidden md:inline">
                                        {videoEnabled ? "Stop Video" : "Start Video"}
                                    </span>
                                </button>
                            </div>

                            {/* Connection Status */}
                            <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                                <div className="flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-1.5 bg-gray-900/50 backdrop-blur-sm rounded-full text-xs sm:text-sm">
                                    <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                                    <span className="hidden sm:inline">Connected</span>
                                </div>
                            </div>
                        </div>

                        {/* Join Form */}
                        <div className="space-y-6 sm:space-y-8">
                            <div className="space-y-4 sm:space-y-6">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder=" "
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && name.trim() && setJoined(true)}
                                        className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-800/50 backdrop-blur border-2 border-gray-700 rounded-xl sm:rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all outline-none text-base sm:text-lg peer"
                                        autoComplete="name"
                                    />
                                    <label className="absolute left-4 sm:left-6 top-3 sm:top-4 text-gray-400 transition-all duration-300 pointer-events-none peer-focus:-translate-y-7 peer-focus:text-sm peer-focus:text-purple-400 peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:text-sm">
                                        Enter your name
                                    </label>
                                </div>

                                <button
                                    onClick={() => setJoined(true)}
                                    disabled={!name.trim()}
                                    className="relative w-full py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl sm:rounded-2xl text-base sm:text-lg font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-98 disabled:opacity-50 disabled:pointer-events-none group overflow-hidden"
                                >
                                    <span className="relative z-10">Join Meeting Now</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                                    <span>End-to-end encrypted</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
                                    <span>All systems operational</span>
                                </div>
                            </div>
                        </div>
                    </main>

                    <footer className="mt-8 sm:mt-12 text-center text-xs sm:text-sm text-gray-500">
                        <p>
                            By joining, you agree to our{" "}
                            <a href="#" className="text-purple-400 hover:text-purple-300 underline transition-colors">
                                Terms of Service
                            </a>{" "}
                            and{" "}
                            <a href="#" className="text-purple-400 hover:text-purple-300 underline transition-colors">
                                Privacy Policy
                            </a>
                        </p>
                    </footer>
                </div>
            </div>
        );
    }

    return <Room name={name} localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack} />;
};