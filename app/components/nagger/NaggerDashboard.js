
import React, { useEffect, useRef, useState } from "react";
import {
    Avatar,
    Center,
    HStack,
    Spinner,
    Box,
    Icon,
    Pressable,
    StatusBar,
    IconButton,
    Drawer,
    VStack,
    Heading,
    Divider,
    Text,
    ScrollView,
} from "native-base";
import { getUsers } from "../../utils/user";
import { FontAwesome, Ionicons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import Naggies from "./Naggies";
import { addNotificationReceivedListener, removeNotificationSubscription } from "expo-notifications";
import NewNagModal from "./NewNagModal";
import { getNags } from "../../utils/nags";
import Nags from "./Nags";
import { AppState } from "react-native";
import Chores from "./Chores";
import NaggerHome from "./NaggerHome.js";
import NewChoreModal from "./NewChoreModal";
import { getChores } from "../../utils/chores";


function NaggerStatusBar({ onDrawerClick, onHomeClick }) {
    return (
        <>
            <StatusBar bg="blueGray.800" barStyle="light-content" />
            <Box safeAreaTop bg="blueGray.800" />
            <HStack bg="blueGray.800" px="2" py="3" justifyContent="space-between" flexDir="row-reverse">
                <IconButton
                    icon={<Icon as={<Octicons name="three-bars" />} />}
                    alignItems="center"
                    onPress={onDrawerClick}
                />
                <Heading alignSelf="center">Nag App</Heading>
                <Pressable onPress={onHomeClick}>
                    <Avatar size="md" source={require('../../assets/amber.jpg')} />
                </Pressable>
            </HStack>
        </>
    )
}


function NaggerBody({ current, naggies, nags, chores, currentChanged, openNewNag, openNewChore }) {
    if (current == 'users') return <Naggies nags={nags} naggies={naggies} openNewNag={openNewNag} currentChanged={currentChanged} />
    if (current == 'nags') return <Nags nags={nags} openNewNag={openNewNag} />
    if (current == 'chores') return <Chores chores={chores} openNewChore={openNewChore} naggies={naggies} />

    return <NaggerHome
        naggies={naggies}
        nags={nags}
        currentChanged={currentChanged}
        openNewNag={openNewNag} />
}


export default function NaggerDashboard() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [newNagIsOpen, setNewNagIsOpen] = useState(false);
    const [newChoreIsOpen, setNewChoreIsOpen] = useState(false);
    const [current, setCurrents] = useState('home');


    const [loading, setLoading] = useState(false);
    const [naggies, setNaggies] = useState([]);
    const [nags, setNags] = useState([]);
    const [chores, setChores] = useState([]);

    const [naggieAssigned, setNaggieAssigned] = useState(null);

    const notificationListener = useRef();

    const retrieveData = async () => {
        const users = await getUsers();
        setNaggies(users.map(user => ({
            key: user._id,
            ...user
        })));

        const ns = await getNags('');
        setNags(ns);
        const chs = await getChores();
        setChores(chs.map(chore => ({
            key: chore._id,
            ...chore
        })));
    };

    const setCurrent = (c) => {
        setDrawerOpen(false);
        setCurrents(c);
    }

    const openNewNag = (assigned) => {
        setNaggieAssigned(assigned);
        setNewNagIsOpen(true);
    }

    useEffect(() => {
        const initialGet = async () => {
            setLoading(true);
            await retrieveData();
            setLoading(false);
        };

        initialGet();

        notificationListener.current = addNotificationReceivedListener(note => retrieveData());

        const subscription = AppState.addEventListener("change", nextAppState => {
            if (nextAppState === "active") {
                initialGet();
            }
        });

        return () => {
            removeNotificationSubscription(notificationListener.current);
            subscription?.remove();
        };
    }, [])

    return (
        <>
            <NaggerStatusBar
                onDrawerClick={() => setDrawerOpen(true)}
                onHomeClick={() => setCurrent('home') }
            />

            { loading && <Center><Spinner size="lg" /></Center> }

            { !loading && (
                <Box flex={1} safeAreaTop  bg="blueGray.900">
                    <NaggerBody
                        current={current}
                        naggies={naggies}
                        nags={nags}
                        chores={chores}
                        currentChanged={setCurrent}
                        openNewNag={openNewNag}
                        openNewChore={() => setNewChoreIsOpen(true)}
                    />

                    <HStack bg="blueGray.800" alignItems="center" safeAreaBottom shadow={6}>
                        <Pressable flex={1} py={2} opacity={current === 'home' ? 1 : 0.5} onPress={() => setCurrent('home')}>
                            <VStack alignItems="center">
                                <Icon
                                    mb="1"
                                    as={current === 'home' ? <Ionicons name="md-home" /> : <Ionicons name="md-home-outline" />}
                                    color="white"
                                    size="sm"
                                />
                                <Text color="white" fontSize={12}>Home</Text>
                            </VStack>
                        </Pressable>
                        <Pressable flex={1} py={2} opacity={current === 'nags' ? 1 : 0.5} onPress={() => setCurrent('nags')}>
                            <VStack alignItems="center">
                                <Icon
                                    mb="1"
                                    as={current === 'nags' ? <Ionicons name="md-alert-circle" /> : <Ionicons name="md-alert-circle-outline" />}
                                    color="white"
                                    size="sm"
                                />
                                <Text color="white" fontSize={12}>Nags</Text>
                            </VStack>
                        </Pressable>
                        <Pressable flex={1} py={2} opacity={current === 'users' ? 1 : 0.5} onPress={() => setCurrent('users')}>
                            <VStack alignItems="center">
                                <Icon
                                    md="1"
                                    as={current === 'users' ? <Ionicons name="md-people" /> : <Ionicons name="md-people-outline" />}
                                    color="white"
                                    size="sm"
                                />
                                <Text color="white" fontSize={12}>Users</Text>
                            </VStack>
                        </Pressable>
                        <Pressable flex={1} py={2} opacity={current === 'chores' ? 1 : 0.5} onPress={() => setCurrent('chores')}>
                            <VStack alignItems="center">
                                <Icon
                                    md="1"
                                    as={current === 'chores' ? <Ionicons name="md-calendar" /> : <Ionicons name="md-calendar-outline" />}
                                    color="white"
                                    sm="sm"
                                />
                                <Text color="white" fontSize={12}>Chores</Text>
                            </VStack>
                        </Pressable>
                    </HStack>
                </Box>
            )}
            <Drawer
                isOpen={drawerOpen}
                side="right"
                onClose={() => setDrawerOpen(false)}
            >
                <Center safeArea w={230} justifyContent="flex-start" zIndex={1}>
                    <ScrollView>
                        <VStack space={6} my={3} mx={2}>
                            <Box px={4}>
                                <Heading bold>Nagger Toolbox</Heading>
                            </Box>
                        </VStack>

                        <VStack w="full" space={4}>
                            <Pressable px={4} py={3} rounded="md" _pressed={{opacity: 0.5}} onPress={() => setCurrent('home')}>
                                <HStack space={7} alignItems="center">
                                    <Icon as={<FontAwesome name="home" />} />
                                    <Text>Home</Text>
                                </HStack>
                            </Pressable>
                            <Divider />
                            <Pressable px={4} py={3} rounded="md" _pressed={{opacity: 0.5}} onPress={() => setCurrent('users')}>
                                <HStack space={7} alignItems="center">
                                    <Icon as={<MaterialCommunityIcons name="account-multiple" />} />
                                    <Text>Users</Text>
                                </HStack>
                            </Pressable>
                            <Divider />
                            <Pressable px={5} py={3} rounded="md" _pressed={{opacity: 0.5}} onPress={() => setCurrent('nags')}>
                                <HStack space={7} alignItems="center">
                                    <Icon as={<MaterialCommunityIcons name="account-alert" />} />
                                    <Text>Nags</Text>
                                </HStack>
                            </Pressable>
                            <Divider />
                            <Pressable px={5} py={3} rounded="md" _pressed={{opacity: 0.5}} onPress={() => setCurrent('chores')}>
                                <HStack space={7} alignItems="center">
                                    <Icon as={<MaterialCommunityIcons name="home-assistant" />} />
                                    <Text>Chores</Text>
                                </HStack>
                            </Pressable>
                        </VStack>
                    </ScrollView>
                </Center>
                
                <Box bg="blueGray.900" alignItems="center">
                    <HStack alignItems="center" safeAreaBottom shadow={6} mb={5}>
                        <VStack>
                            <Heading size="sm">App Version 0.0.2</Heading>
                            <Heading size="sm">By Some bitch Zack</Heading>
                        </VStack>
                    </HStack>
                </Box>
            </Drawer>
            <NewNagModal
                naggies={naggies}
                isOpen={newNagIsOpen}
                assigned={naggieAssigned}
                onClose={() => {
                    setNaggieAssigned(null);
                    setNewNagIsOpen(false);
                }}
            />
            <NewChoreModal
                isOpen={newChoreIsOpen}
                onClose={() => setNewChoreIsOpen(false)}
                naggies={naggies}
            />

        </>
    );
}