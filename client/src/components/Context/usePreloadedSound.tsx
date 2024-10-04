import { useState, useEffect } from 'react';
import { Howl } from 'howler';

export const usePreloadedSound = () => {
    const [sounds, setSounds] = useState<{ [key: string]: Howl | null }>({
        sound1: null,
        sound2: null,
    });

    const preloadedSound = () => {
        const sound1 = new Howl({
            src: ['/game_sounds/mixkit-winning-a-coin-video-game-2069.wav'],
            volume: 1.0,
        });

        const sound2 = new Howl({
            src: ['/game_sounds/mixkit-game-ball-tap-2073.wav'], // Replace with actual sound path
            volume: 1.0,
        });

        sound1.once('load', () => {
            console.log('Sound 1 preloaded successfully');
            setSounds((prevSounds) => ({ ...prevSounds, sound1 }));
        });

        sound2.once('load', () => {
            console.log('Sound 2 preloaded successfully');
            setSounds((prevSounds) => ({ ...prevSounds, sound2 }));
        });

        sound1.once('loaderror', (id, error) => {
            console.error('Sound 1 loading error:', error);
        });

        sound2.once('loaderror', (id, error) => {
            console.error('Sound 2 loading error:', error);
        });
    };

    return { preloadedSound, sounds };
};