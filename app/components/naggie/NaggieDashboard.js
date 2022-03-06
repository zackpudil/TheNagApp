import { Ionicons, MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { addNotificationReceivedListener, removeNotificationSubscription } from "expo-notifications";
import { Avatar, Box, Center, Heading, HStack, IconButton, Spinner, StatusBar, VStack, Pressable, Icon, Drawer, ScrollView, Text } from "native-base";
import React, { useEffect, useRef, useState } from "react";
import { Alert, AppState } from "react-native";
import { getNags } from "../../utils/nags";
import { getUserFromDeviceToken, getUsers } from "../../utils/user";
import Nags from "./Nags";

const images = {
    zack: require('../../assets/zack.jpg'),
    mike: require('../../assets/mike.jpg'),
    gabe: require('../../assets/gabe.jpg')
};

function NaggieStatusBar({ naggie, onDrawerClick }) {
    return (
        <>
            <StatusBar bg="blueGray.800" barStyle="light-content" />
            <Box safeAreaTop bg="blueGray.800" />
            <HStack bg="blueGray.800" px="2" py="3" alignItems="center" justifyContent="space-between" flexDir="row-reverse">
                <IconButton
                    icon={<Icon as={<Octicons name="three-bars" />} />}
                    alignItems="center"
                    onPress={onDrawerClick}
                />
                <Heading>{naggie.xp} XP</Heading>
                <Pressable>
                    <Avatar size="md" source={images[naggie.name]} />
                </Pressable>
            </HStack>
        </>
    )
}

export default function NaggieDashboard() {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState({});
    const [nags, setNags] = useState([]);
    const [naggies, setNaggies] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const notificaitonListener = useRef();

    const reloadData = async () => {
        const user = await getUserFromDeviceToken();
        setUser(user);

        const nagsRequest = await getNags(`user/${user.deviceToken}`);

        setNags(nagsRequest);
        const naggiesRequest = await getUsers();
        setNaggies(naggiesRequest);
    };

    useEffect(() => {
        const initialLoad = async() => {
            setLoading(true);
            await reloadData();
            setLoading(false);
        };

        notificaitonListener.current = addNotificationReceivedListener(note => reloadData());

        const subscription = AppState.addEventListener("change", nextAppState => {
            if (nextAppState === "active") {
                initialLoad();
            }
           
        });

        initialLoad();

        return () => {
            removeNotificationSubscription(notificaitonListener.current);
            subscription?.remove();
        };
    }, []);

    const current = "nags";

    return (
        <>
            <NaggieStatusBar naggie={user} onDrawerClick={() => setDrawerOpen(true)} />
            { loading && <Center><Spinner size="lg" /></Center>}
            { !loading && user.approved && (
                <Nags nags={nags} user={user} />
            )}
            { !loading && user.needsApproval && (
                <Center>
                    <Heading mb={5}>We waiting on Approval</Heading>
                    <Avatar size="200" source={require('../../assets/amber.jpg')} />
                    <Heading mt={5}>Yell at this bish</Heading>
                </Center>
            )}
            <HStack bg="blueGray.800" alignItems="center" safeAreaBottom shadow={6} style={{elevation: -1}}>
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
                <Pressable flex={1} py={2} opacity={current === 'store' ? 1 : 0.5} onPress={() => Alert.alert('Not Yet', 'Hold ya fucking horses', [{ text: 'Okay', style: 'cancel'}])}>
                    <VStack alignItems="center">
                        <Icon
                            mb="1"
                            as={current === 'store' ? <MaterialCommunityIcons name="currency-usd-circle" /> : <MaterialCommunityIcons name="currency-usd-circle-outline" />}
                            color="white"
                            size="sm"
                        />
                        <Text color="white" fontSize={12}>Xp Store</Text>
                    </VStack>
                </Pressable>
            </HStack>
            <Drawer
                isOpen={drawerOpen}
                side="right"
                onClose={() => setDrawerOpen(false)}
            >
                <Center w={230} safeArea h={230} >
                    <ScrollView>
                        <VStack space={6} my={3} mx={2}>
                            <Box px={4}>
                                <Heading bold>Leaderboards</Heading>
                            </Box>
                        </VStack>
                        <VStack w="full" space={4}>
                            { naggies.map(naggie => {
                                return (
                                    <HStack key={naggie._id} alignItems="center" justifyContent="space-between">
                                        <Avatar source={images[naggie.name]} />
                                        <Heading>{naggie.xp}</Heading>
                                    </HStack>
                                )
                            })}
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
        </>
    );
}