import React, { useEffect, useState } from 'react';
import {
    Image,
    Input,
    Modal,
    ScrollView,
    VStack,
    Pressable,
    HStack,
    Avatar,
    Heading,
    Badge,
    Button,
    useToast,
} from 'native-base';
import { createNag } from '../../utils/nags';
import TakePicture from '../common/TakePicture';

const images = {
    zack: require('../../assets/zack.jpg'),
    mike: require('../../assets/mike.jpg'),
    gabe: require('../../assets/gabe.jpg')
};

export default function NewNagModal({ assigned, isOpen, onClose, naggies }) {
    const [naggieAssigned, setNaggieAssigned] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const [nagDesc, setNagDesc] = useState(null);
    const [picture, setPicture] = useState(null);
    const [loading, setLoading] = useState(false);

    const toast = useToast();

    useEffect(() => {
        setNaggieAssigned(assigned);
    }, [assigned])

    const close = () => {
        setNagDesc(null);
        setPicture(null);
        setNaggieAssigned(null);
        onClose();
    };

    const submitNag = async () => {
        setLoading(true);
        await createNag({
            title: nagDesc,
            isAssigned: !!naggieAssigned,
            assignedToName: naggieAssigned?.name,
            assignedToDeviceToken: naggieAssigned?.deviceToken
        }, picture);

        setLoading(false);
        close();
        toast.show({
            description: `Twis this day this nag has been nagged`,
            status: 'success',
            title: 'A Nag as been nagged',
            duration: 3000
        });
    }

    const valid = () => !!nagDesc && !!picture;

    if (showCamera) {
        return <TakePicture
            onClose={() => {
                setPicture(null);
                setShowCamera(false);
            }}
            onPicture={(pic) => {
                setPicture(pic);
                setShowCamera(false);
            }}
        />
    }

    return (
        <Modal isOpen={isOpen} onClose={close} size="full">
            <Modal.Content h="full">
                <Modal.CloseButton />
                <Modal.Header>These bitches need a nag or two</Modal.Header>
                <Modal.Body>
                    <ScrollView>
                        <VStack space={3} alignItems="center">
                            <Input autoCorrect={false} placeholder="Nag Desc" size="lg" w={300} onChangeText={setNagDesc} value={nagDesc} />
                            <Pressable _pressed={{opacity: 0.5}} onPress={() => setShowCamera(true)}>
                                {picture == null && (
                                    <Image alt="PlaceHolder" w={350} h={350} source={require('../../assets/placeholder.jpg')} />
                                )}
                                {picture != null && (
                                    <Image resizeMode="contain" alt="something" h={350} source={picture} />
                                )}
                            </Pressable>
                            <Heading>Assign To: </Heading>
                            { naggieAssigned == null && (
                                <HStack>
                                    {naggies.map(naggie => {
                                        return (
                                            <Pressable key={naggie.name} onPress={() => setNaggieAssigned(naggie)}>
                                                <Avatar source={images[naggie.name]} size="lg" />
                                            </Pressable>
                                        );
                                    })}
                                </HStack>
                            )}
                            { naggieAssigned !== null && (
                                <Pressable onPress={() => setNaggieAssigned(null)}>
                                    <Badge
                                        colorScheme="danger"
                                        rounded="9999px"
                                        mb={-4}
                                        mr={-3}
                                        zIndex={1}
                                        alignSelf="flex-end"
                                        _text={{ fontsize: 12 }}
                                    >
                                        X
                                    </Badge>
                                    <Avatar source={images[naggieAssigned.name]} size="lg" />
                                </Pressable>
                            )}
                        </VStack>
                    </ScrollView>
                </Modal.Body>
                <Modal.Footer>
                    <Button.Group space={2}>
                        <Button onPress={close}>Cancel</Button>
                        <Button isLoading={loading} disabled={loading || !valid()} onPress={submitNag}>Nag</Button>
                    </Button.Group>
                </Modal.Footer>
            </Modal.Content>
        </Modal>
    )
}