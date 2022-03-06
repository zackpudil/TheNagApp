import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    HStack,
    Image,
    ScrollView,
    VStack,
    Text,
    Avatar,
    Pressable,
    Spinner,
    Flex,
    Heading,
    Divider,
    Fab,
    Icon,
    IconButton,
    Spacer,
    useToast,
    Menu,
    HamburgerIcon
} from 'native-base';
import { AntDesign, Entypo, Ionicons, MaterialIcons, Octicons } from '@expo/vector-icons';
import { alertAllNags, alertNag, approveNag, deleteNag, denyNag, getChoreImage } from '../../utils/nags';

const images = {
    zack: require('../../assets/zack.jpg'),
    mike: require('../../assets/mike.jpg'),
    gabe: require('../../assets/gabe.jpg')
};

function Nag({ nag }) {
    const [beforeLoading, setBeforeLoading] = useState(false);
    const [afterLoading, setAfterLoading] = useState(false);

    const [deleting, setDeleting] = useState(false);
    const [alerting, setAlerting] = useState(false);
    const [approving, setApproving] = useState(false);
    const [denying, setDenying] = useState(false);

    const toast = useToast();

    const onPressDeleteNag = async () => {
        setDeleting(true);
        await deleteNag(nag._id);
    };

    const onPressAlert = async () => {
        setAlerting(true);
        await alertNag(nag._id);
        setAlerting(false);
        toast.show({
            title: `${nag.assignedToName} has been notified, nicely, about this nag`,
            status: 'success',
            duration: 3000,
            placement: 'top'
        });
    };

    const onPressApproveNag = async () => {
        setApproving(true);
        await approveNag(nag._id);
        toast.show({
            title: `Approved nag, ${nag.assignedToName} will get 20 xp points`,
            status: 'success',
            duration: 3000,
            placement: 'top'
        });
    };

    const onPressDenyNag = async () => {
        setDenying(true);
        await denyNag(nag._id);
        toast.show({
            title: `Denied nag, ${nag.assignedToName} gets -15 xp points`,
            status: 'info',
            duration: 3000,
            placement: 'top'
        });
        setDenying(false);
    }

    return (
        <VStack mx={5} py={2}>
            <HStack bg="dark.200" p={3} borderTopRadius={15} justifyContent="space-around">
                <Heading flex={1} numberOfLines={1} ellipsizeMode="tail" alignSelf="center">{nag.title}</Heading>
                {nag.isAssigned && (
                    <Avatar size="lg" source={images[nag.assignedToName]} />
                )}
                {!nag.isAssigned && (
                    <Avatar size="lg" source={require('../../assets/idiots.jpg')} />
                )}
            </HStack>
            <Divider />
            <Box p={2} bg={nag.denied ? 'red.400' : 'dark.100'}>
                <Pressable _pressed={{opacity: 0.5}}>
                    <HStack justifyContent="space-around">
                        <VStack> 
                            <Text alignSelf="center">Before</Text>
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
                        <VStack>
                            <Text alignSelf="center">After</Text>
                            <Flex>
                                { (nag.awaitingApproval || nag.denied) && (
                                    <>
                                        <Image
                                            onLoadStart={() => setAfterLoading(true)}
                                            onLoadEnd={() => setAfterLoading(false)}
                                            w={160}
                                            h={160*2}
                                            source={{uri: nag.afterUri }}
                                            alt="whoops"
                                        />
                                        <Spinner style={{ display: afterLoading ? 'flex' : 'none'}} mt={-300} size="lg" animating={afterLoading} />
                                    </>
                                )}
                                { !nag.awaitingApproval && !nag.denied && (
                                    <Image w={160} h={160*2} source={require("../../assets/placeholder.jpg")} alt="placeholder" />
                                )}
                            </Flex>
                        </VStack>
                    </HStack>
                </Pressable>
            </Box>
            <Box p={2} bg="dark.200">
                <HStack justifyContent="center" space={5}>

                    { nag.isAssigned && !nag.awaitingApproval && !alerting && (
                        <IconButton onPress={onPressAlert} size="lg" rounded="full" bg="purple.400" icon={<Icon color="white" as={<Octicons name="megaphone" />} />} title="Yell" />
                    )}
                    { alerting && <Spinner size="lg" /> }

                    { !deleting && !nag.awaitingApproval && (
                        <IconButton onPress={onPressDeleteNag} size="lg" rounded="full" bg="red.400" icon={<Icon as={<AntDesign name="delete" />} />} title="Trash" />
                    )}
                    { deleting && <Spinner size="lg" />}

                    { nag.awaitingApproval && !approving && (
                        <IconButton onPress={onPressApproveNag} size="lg" rounded="full" bg="emerald.400" icon={<Icon as={<AntDesign name="check" />} />} title="Approve" />
                    )}
                    { approving && <Spinner size="lg" />}

                    { nag.awaitingApproval && !denying && (
                            <IconButton onPress={onPressDenyNag} size="lg" rounded="full" bg="red.400" icon={<Icon as={<AntDesign name="close" />} />} title="Deny" />
                    )}
                    { denying && <Spinner size="lg" />}
                </HStack>
            </Box>
        </VStack>
    );
}

export default function Nags({ nags, openNewNag }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [alertingAll, setAlertingAll] = useState(false);
    const [nagFilter, setNagFilter] = useState('all');
    const [filteredNags, setFilteredNags] = useState([...nags]);
    const toast = useToast();
    const nagsScroller = useRef();

    useEffect(() => {
        nagsScroller.current.scrollTo({ x: 0, y: 0, animated: true });
        switch(nagFilter) {
            case 'all':
                setFilteredNags([...nags]);
                break;
            case 'assigned':
                setFilteredNags(nags.filter(nag => nag.isAssigned && !nag.awaitingApproval));
                break;
            case 'unassigned':
                setFilteredNags(nags.filter(nag => !nag.isAssigned));
                break;
            case 'approval':
                setFilteredNags(nags.filter(nag => nag.awaitingApproval));
                break;
            default:
                setFilteredNags([...nags]);
        }
    }, [nags, nagFilter]);

    const onPressAlertAllNags = async () => {
        setAlertingAll(true)
        await alertAllNags();
        setAlertingAll(false);
        setMenuOpen(false);

        toast.show({
            title: 'These bitches have been told!, nicley tho',
            status: 'success',
            duration: 3000,
            placement: 'top'
        });
    };

    return (
        <>
            <Menu
                isOpen={menuOpen}
                onOpen={() => setMenuOpen(true)}
                onClose={() => setMenuOpen(false)}
                placement="top left"
                w={200}
                rounded="md"
                offset={-25}
                crossOffset={-300}
                alignItems="center"
                shouldOverlapWithTrigger={false}
                closeOnSelect={false}
                trigger={(triggerProps) => {
                    return (
                        <Fab
                            bottom={70}
                            placement="bottom-right"
                            colorScheme="dark"
                            bg={
                                nagFilter === 'assigned' ? 'orange.400'
                                    : nagFilter === 'approval' ? 'emerald.400'
                                    : nagFilter === 'unassigned' ? 'purple.400'
                                    : 'dark.500'
                            }
                            size="lg"
                            icon={<Icon as={<Ionicons name="filter" />} />}
                            {...triggerProps}
                        />
                    );
                }}
            >
                <Menu.Group title="actions">
                    <Menu.Item>
                        <HStack justifyContent="space-between" space={3}>
                            <IconButton
                                onPress={() => {
                                    setMenuOpen(false);
                                    openNewNag(null);
                                }}
                                icon={<Icon as={<AntDesign name="plus" />} />}
                                size="lg"
                                rounded="full"
                                bg="emerald.400"
                            />
                            {!alertingAll && (
                                <IconButton
                                    onPress={onPressAlertAllNags}
                                    icon={<Icon as={<Octicons name="megaphone" />} />}
                                    size="lg"
                                    rounded="full"
                                    bg="purple.400"
                                />
                            )}
                            {alertingAll && (
                                <Box bg="purple.400" rounded="full" p={2.5}>
                                    <Spinner size="lg" color="white" />
                                </Box>
                            )}
                        </HStack>
                    </Menu.Item>
                </Menu.Group>
                <Menu.Group title="filters">
                    <Menu.Item onPress={() => { setNagFilter("unassigned"); setMenuOpen(false); }}>
                        <HStack alignItems="center" space={1}>
                            <Icon size="lg" as={<MaterialIcons name="assignment-late" />} />
                            <Text>Unassigned</Text>
                        </HStack>
                    </Menu.Item>
                    <Divider />
                    <Menu.Item onPress={() => { setNagFilter("assigned"); setMenuOpen(false); }}>
                        <HStack alignItems="center" space={1}>
                            <Icon size="lg" as={<MaterialIcons name="assignment-ind" />} />
                            <Text>Assigned</Text>
                        </HStack>
                    </Menu.Item>
                    <Divider />
                    <Menu.Item onPress={() => { setNagFilter("approval"); setMenuOpen(false); }}>
                        <HStack alignItems="center" space={1}>
                            <Icon size="lg" as={<MaterialIcons name="approval" />} />
                            <Text>Needs Approval</Text>
                        </HStack>
                    </Menu.Item>
                    <Divider />
                    <Menu.Item onPress={() => { setNagFilter("all"); setMenuOpen(false); }}>
                        <HStack alignItems="center" space={1}>
                            <Icon size="lg" as={<MaterialIcons name="assignment" />} />
                            <Text>All</Text>
                        </HStack>
                    </Menu.Item>
                </Menu.Group>
            </Menu>
            <ScrollView ref={nagsScroller}>
                <VStack space={7}>
                    { [...filteredNags].reverse().map(nag => <Nag key={nag._id} nag={nag} />) }
                    <Spacer size={10} />
                </VStack>
            </ScrollView>
            {nags.length == 0 && (
                <Box flex={1} justifyContent="center" alignItems="center">
                    <Heading>No Nags, create some.</Heading>
                </Box>
            )}
        </>
    );
}