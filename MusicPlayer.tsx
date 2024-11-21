import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Dimensions,
    TouchableOpacity,
    Image,
} from 'react-native';
import TrackPlayer, {
    Capability,
    State,
    Event,
    usePlaybackState,
    useProgress,
    useTrackPlayerEvents,
    Track,
} from 'react-native-track-player';
import Slider from '@react-native-community/slider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import podcasts from './assets/data';

interface MusicPlayerProps { }

const MusicPlayer: React.FC<MusicPlayerProps> = () => {
    const podcastsCount = podcasts.length;
    const [trackIndex, setTrackIndex] = useState<number>(0);
    const [trackTitle, setTrackTitle] = useState<string>('');
    const [trackArtist, setTrackArtist] = useState<string>('');
    const [trackArtwork, setTrackArtwork] = useState<string>('');

    const playBackState = usePlaybackState();
    const progress = useProgress();

    const setupPlayer = async () => {
        try {
            await TrackPlayer.setupPlayer();
            await TrackPlayer.updateOptions({
                capabilities: [
                    Capability.Play,
                    Capability.Pause,
                    Capability.SkipToNext,
                    Capability.SkipToPrevious,
                ],
            });
            await TrackPlayer.add(podcasts);
            await getTrackData();
            await TrackPlayer.play();
        } catch (error) {
            console.error("Error setting up the player:", error);
        }
    };

    useTrackPlayerEvents([Event.PlaybackTrackChanged], async (event) => {
        if (event.type === Event.PlaybackTrackChanged && event.nextTrack !== null) {
            const track = await TrackPlayer.getTrack(event.nextTrack);
            if (track) {
                const { title, artwork, artist } = track as Track;
                setTrackIndex(event.nextTrack);
                setTrackTitle(title || '');
                setTrackArtist(artist || '');
                setTrackArtwork(artwork || '');
            }
        }
    });

    const getTrackData = async () => {
        const currentTrackIndex = await TrackPlayer.getCurrentTrack();
        if (currentTrackIndex !== null) {
            const track = await TrackPlayer.getTrack(currentTrackIndex);
            if (track) {
                const { title, artwork, artist } = track as Track;
                setTrackIndex(currentTrackIndex);
                setTrackTitle(title || '');
                setTrackArtist(artist || '');
                setTrackArtwork(artwork || '');
            }
        }
    };

    const togglePlayback = async (playBackState: State) => {
        const currentTrack = await TrackPlayer.getActiveTrack();
        if (currentTrack !== null) {
            if (playBackState === State.Paused || playBackState === State.Ready) {
                await TrackPlayer.play();
            } else {
                await TrackPlayer.pause();
            }
        }
    };

    const nextTrack = async () => {
        if (trackIndex < podcastsCount - 1) {
            await TrackPlayer.skipToNext();
            getTrackData();
        }
    };

    const previousTrack = async () => {
        if (trackIndex > 0) {
            await TrackPlayer.skipToPrevious();
            getTrackData();
        }
    };

    useEffect(() => {
        setupPlayer();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainContainer}>
                <View style={styles.mainWrapper}>
                    <Image source={{ uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb8H_nEERpCqQ0JtathajCngX0FEvUsQIvxg&s" }} style={styles.imageWrapper} />
                </View>
                <View style={styles.songText}>
                    <Text style={[styles.songContent, styles.songTitle]} numberOfLines={3}>
                        {trackTitle}
                    </Text>
                    <Text style={[styles.songContent, styles.songArtist]} numberOfLines={2}>
                        {trackArtist}
                    </Text>
                </View>
                <View>
                    <Slider
                        style={styles.progressBar}
                        value={progress.position}
                        minimumValue={0}
                        maximumValue={progress.duration}
                        thumbTintColor="#FFD369"
                        minimumTrackTintColor="#FFD369"
                        maximumTrackTintColor="#fff"
                        onSlidingComplete={async (value) => await TrackPlayer.seekTo(value)}
                    />
                    <View style={styles.progressLevelDuration}>
                        <Text style={styles.progressLabelText}>
                            {new Date(progress.position * 1000).toISOString().substr(14, 5)}
                        </Text>
                        <Text style={styles.progressLabelText}>
                            {new Date((progress.duration - progress.position) * 1000)
                                .toISOString()
                                .substr(14, 5)}
                        </Text>
                    </View>
                </View>
                <View style={styles.musicControlsContainer}>
                    <TouchableOpacity onPress={previousTrack}>
                        <Ionicons name="play-skip-back-outline" size={35} color="#FFD369" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => togglePlayback(playBackState)}>
                        <Ionicons
                            name={
                                playBackState === State.Playing
                                    ? 'pause-circle'
                                    : playBackState === State.Loading
                                        ? 'caret-down-circle'
                                        : 'play-circle'
                            }
                            size={75}
                            color="#FFD369"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={nextTrack}>
                        <Ionicons name="play-skip-forward-outline" size={35} color="#FFD369" />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default MusicPlayer;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222831',
    },
    mainContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainWrapper: {
        width: width,
        height: width,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageWrapper: {
        alignSelf: 'center',
        width: '90%',
        height: '90%',
        borderRadius: 15,
    },
    songText: {
        marginTop: 2,
        height: 70,
    },
    songContent: {
        textAlign: 'center',
        color: '#EEEEEE',
    },
    songTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    songArtist: {
        fontSize: 16,
        fontWeight: '300',
    },
    progressBar: {
        alignSelf: 'stretch',
        marginTop: 40,
        marginLeft: 5,
        marginRight: 5,
    },
    progressLevelDuration: {
        width: width,
        padding: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressLabelText: {
        color: '#FFF',
    },
    musicControlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
        width: '60%',
    },
});
