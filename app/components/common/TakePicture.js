import React, { useEffect, useRef, useState } from 'react';
import { Box, Flex, Heading, StatusBar, VStack, Pressable, Icon, Spinner } from 'native-base';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { manipulateAsync } from 'expo-image-manipulator';

function CameraControls({ onClose, takePicture, takingPicture }) {
    return (
        <VStack h="full" alignItems="center" safeArea>
            <Pressable alignSelf="flex-start" _pressed={{opacity: 0.5}} mt={15} onPress={onClose}> 
                <Box w={75} h={75}>
                    <Icon as={<Ionicons name="arrow-back" />} size="xl" />
                </Box>
            </Pressable>
            <Pressable _pressed={{opacity: 0.5}} mb={10} onPress={takePicture} mt="auto">
                <Box w={75} h={75} rounded="full" bg="white" alignItems="center" justifyContent="center">
                    {!takingPicture && (
                        <Icon as={<Ionicons name="camera" />} size="xl"  color="black"/>
                    )}
                    {takingPicture && (
                        <Spinner size="lg" color="black" />
                    )}
                </Box>
            </Pressable>
        </VStack>
    );
}

export default function TakePicture({ onPicture, onClose }) {
    const [hasPerm, setHasPerm] = useState(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [takingPicture, setTakingPicture] = useState(false);
    const camera = useRef();

    useEffect(() => {
        const getPerm = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPerm(status === 'granted');
        };

        getPerm();
    }, [])

    const takePicture = async () => {
        if (cameraReady) {
            setTakingPicture(true);
            let rawPhoto = await camera.current.takePictureAsync();
            let photo = await manipulateAsync(
                rawPhoto.uri,
                [
                    { resize: { width: 160, height: 160*2 } }
                ],
                { format: 'jpeg', compress: 1 }
            );
            setTakingPicture(false);
            onPicture(photo);
        }
    };

    if (!hasPerm) return (
        <Box bg="darkBlue.900" zIndex={5} position="absolute" top={0} left={0} w="full" height="full">
            <Heading position="absolute" top="1/2" alignSelf="center"  zIndex={6}>Gimme Camera Permission</Heading>
            <CameraControls onClose={onClose} takePicture={takePicture} />
        </Box>
    )

    return (
        <Box zIndex={5} position="absolute" top={0} left={0} w="full" height="full">
            <Flex>
                <StatusBar translucent />
                <Camera
                    ref={camera}
                    stlye={{flex: 1}}
                    type={Camera.Constants.Type.back}
                    onCameraReady={() => setCameraReady(true)}
                >
                    <CameraControls onClose={onClose} takePicture={takePicture} takingPicture={takingPicture} />
                </Camera>
            </Flex>
        </Box>
    )
}
