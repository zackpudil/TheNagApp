import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    HStack,
    Image,
    ScrollView,
    VStack,
    Pressable,
    Spinner,
    Flex,
    Heading,
    Divider,
    Spacer,
    Button,
    Icon,
    useToast,
    Modal,
    Text,
    IconButton,
    Menu,
    Fab
} from 'native-base';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { assignNag, doTheNag, getChoreImage } from '../../utils/nags';
import TakePicture from '../common/TakePicture';

function DoNag({ nag, isOpen, onClose }) {
    const [doing, setDoing] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [picture, setPicture] = useState(null);
    const toast = useToast();

    const doNag = async () => {
        setDoing(true);
        await doTheNag(nag, picture);
        setDoing(false);
        setPicture(null);
        onClose();
        toast.show({
            title: 'Good job! Amber got a message to approve your work',
            status: 'success',
            position: 'bottom'
        });
    };

    if (showCamera) {
        return <TakePicture
            onClose={() => setShowCamera(false)}
            onPicture={(pic) => {
                setPicture(pic);
                setShowCamera(false);
            }}
        />
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <Modal.Content>
                <Modal.CloseButton />
                <Modal.Header>
                    <Text bold alignSelf="center">Prove It</Text>
                </Modal.Header>
                <Modal.Body>
                    <Box alignItems="center">
                        { !picture && (
                            <Text>We need a picture to prove it!</Text>
                        )}
                        { !!picture && (
                            <Pressable onPress={() => setShowCamera(true)}>
                                <Image 
                                    w={160}
                                    h={160*2}
                                    source={picture}
                                    alt="whoops"
                                />
                            </Pressable>
                        )}
                    </Box>
                </Modal.Body>
                <Modal.Footer justifyContent="center">
                     { !picture && (
                        <IconButton
                            alignItems="center"
                            bg="emerald.400"
                            rounded="full"
                            onPress={() => setShowCamera(true)}
                            icon={<Icon as={<AntDesign name="camera" />} />}
                        />
                    )}
                    {!!picture && (
                        <Button
                            onPress={doNag}
                            isLoading={doing}
                            bg="emerald.400"
                            leftIcon={<Icon as={<Ionicons name="checkmark-done" />} />}
                        >
                            TELL THAT BITCH
                        </Button>
                    )}
                </Modal.Footer>
            </Modal.Content>
        </Modal>
    );
}

function Nag({ nag, user, onDoNag }) {
    const [beforeLoading, setBeforeLoading] = useState(false);
    const [afterLoading, setAfterLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);

    const toast = useToast();

    const assign = async () => {
        setAssigning(true);
        await assignNag(nag._id, user.deviceToken);
        toast.show({
            position: 'top',
            title: 'You assigned yourself, 10 xp points for you!',
            status: 'success'
        });
    };

    return (
        <VStack mx={5} py={2}>
            <HStack bg="dark.200" p={3} borderTopRadius={15} justifyContent="space-around">
                <Heading flex={1} numberOfLines={1} ellipsizeMode="tail" alignSelf="center">{nag.title}</Heading>
            </HStack>
            <Divider />
            <Box p={2} bg={nag.denied ? 'red.300' : 'dark.100'}>
                <Pressable _pressed={{opacity: 0.5}}>
                    <HStack justifyContent="center" space={2}>
                        <VStack> 
                            <Flex>
                                <Image
                                    onLoadStart={() => setBeforeLoading(true)}
                                    onLoadEnd={() => setBeforeLoading(false)}
                                    w={160}
                                    h={160*2}
                                    source={nag.choreImage ? getChoreImage(nag.title) : {uri: nag.uri}}
                                    alt="whoops"
                                />
                                <Spinner style={{ display: beforeLoading ? 'flex' : 'none' }} mt={-300} size="lg" animating={beforeLoading} />
                            </Flex>
                        </VStack>
                        {!!nag.denied && (
                            <VStack>
                                <Flex>
                                    <Image
                                        onLoadStart={() => setAfterLoading(true)}
                                        onLoadEnd={() => setAfterLoading(false)}
                                        w={160}
                                        h={160*2}
                                        source={{uri: nag.afterUri}}
                                        alt="whoops"
                                    />
                                    <Spinner style={{ display: afterLoading ? 'flex' : 'none' }} mt={-300} size="lg" animating={afterLoading} />
                                </Flex>
                            </VStack>
                        )}
                    </HStack>
                </Pressable>
            </Box>
            <Box p={2} bg="dark.200">
                <HStack justifyContent="center" space={5}>
                    { nag.isAssigned && (
                        <Button onPress={() => onDoNag(nag)} leftIcon={<Icon color="emerald.400" as={<Ionicons name="checkmark-done-circle" />} />}>
                            Did it
                        </Button>
                    )}
                    { !nag.isAssigned && (
                        <Button
                            disabled={assigning}
                            isLoading={assigning}
                            leftIcon={<Icon color="purple.400" as={<MaterialIcons name="assignment-ind" />} />}
                            onPress={assign}
                        >
                            Gimme
                        </Button>
                    )}
                </HStack>
            </Box>
        </VStack>
    );
}

export default function Nags({ nags, user }) {
    const [showNagDo, setShowNagDo] = useState(false);
    const [nagToDo, setNagToDo] = useState(null);
    const [nagFilter, setNagFilter] = useState('all');
    const [filteredNags, setFilteredNags] = useState(nags);
    const nagsScroller = useRef();

    useEffect(() => {
        nagsScroller.current.scrollTo({ x: 0, y: 0, animated: true });
        switch(nagFilter) {
            case 'all':
                setFilteredNags([...nags]);
                break;
            case 'assigned':
                setFilteredNags(nags.filter(nag => nag.isAssigned));
                break;
            case 'unassigned':
                setFilteredNags(nags.filter(nag => !nag.isAssigned));
                break;
            default:
                setFilteredNags([...nags]);
        }
    }, [nags, nagFilter]);

    const onDoNag = async (nag) => {
        setNagToDo(nag);
        setShowNagDo(true);
    };

    return (
        <>
            <Box bg="darkBlue.900" flex={1}>
                <Menu
                    placement="top left"
                    w={150}
                    rounded="md"
                    offset={-25}
                    crossOffset={-270}
                    alignItems="center"
                    trigger={(triggerProps) => {
                        return (
                            <Fab
                                placement="bottom-right"
                                colorScheme="dark"
                                bottom={75}
                                bg={
                                    nagFilter === 'assigned' ?'emerald.400'
                                        : nagFilter === 'unassigned' ? 'purple.400'
                                        : 'dark.500'}
                                size="lg"
                                icon={<Icon as={<Ionicons name="filter" />} />} 
                                {...triggerProps}
                            />
                        )
                    }}
                >
                    <Menu.Item onPress={() => setNagFilter("unassigned")}>
                        <HStack alignItems="center" space={1}>
                            <Icon size="lg" as={<MaterialIcons name="assignment-late" />} />
                            <Text>Unassigned</Text>
                        </HStack>
                    </Menu.Item>
                    <Divider />
                    <Menu.Item onPress={() => setNagFilter("assigned")}>
                        <HStack alignItems="center" space={1}>
                            <Icon size="lg" as={<MaterialIcons name="assignment-ind" />} />
                            <Text>Assigned</Text>
                        </HStack>
                    </Menu.Item>
                    <Divider />
                    <Menu.Item onPress={() => setNagFilter("all")}>
                        <HStack alignItems="center" space={1}>
                            <Icon size="lg" as={<MaterialIcons name="assignment" />} />
                            <Text>All</Text>
                        </HStack>
                    </Menu.Item>
                </Menu>
                { nags.length == 0 && (
                    <Heading mt="100" alignSelf="center">No Nags, good job!</Heading>
                )}
                <ScrollView ref={nagsScroller}>
                    <VStack space={7}>
                        { [...filteredNags].reverse().map(nag =>
                            <Nag
                                onDoNag={onDoNag}
                                key={nag._id}
                                nag={nag}
                                user={user}
                            />
                        )}
                        <Spacer size={16} />
                    </VStack>
                </ScrollView>
            </Box>
            <DoNag
                nag={nagToDo}
                isOpen={showNagDo}
                onClose={() => setShowNagDo(false)}
            />
        </>
    );
}