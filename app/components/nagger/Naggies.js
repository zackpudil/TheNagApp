import React, { useEffect, useState } from "react";
import {
    Avatar,
    HStack,
    Spacer,
    VStack,
    Text,
    Box,
    Heading,
    Icon,
    Pressable,
    Spinner,
    Center
} from "native-base";
import { SwipeListView } from "react-native-swipe-list-view";
import { Entypo, FontAwesome, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { deleteUser, updateUser } from "../../utils/user";
import { Alert } from "react-native";

const images = {
    zack: require('../../assets/zack.jpg'),
    mike: require('../../assets/mike.jpg'),
    gabe: require('../../assets/gabe.jpg')
};

const descriptions = {
    zack: 'Ya Hubby',
    mike: 'Ya Brahver',
    gabe: 'Ya Roomie'
};

export default function Naggies({ naggies, nags, openNewNag, currentChanged }) {

    const [isApproving, setIsApproving] = useState(naggies.map(n => ({ key: n.key, isApproving: false })));

    useEffect(() => {
        setIsApproving(naggies.map(n => ({ key: n.key, isApproving: false })));
    }, [naggies]);

    const approveUser = async (naggie, rowMap) => {
        rowMap[naggie.key].closeRow();
        setIsApproving(isApproving.map(n => {
            if (n.key == naggie.key) return { key: n.key, isApproving: true };
            return n;
        }));

        updateUser({
            ...naggie,
            needsApproval: false,
            approved: true
        });
    };

    const denyUser = async (naggie, rowMap) => {
        rowMap[naggie.key].closeRow();

        Alert.alert("THIS BITCH", "We gonna tell this bitch they lying!", [
            {
                text: 'Tell EM!',
                onPress: () => {
                    setIsApproving(isApproving.map(n => {
                        if (n.key == naggie.key) return { key: n.key, isApproving: true };
                        return n;
                    }));
                    deleteUser(naggie);
                },
                style: "default"
            },
            {
                text: 'NAW',
                style: 'cancel',
                onPress: () => {
                    setIsApproving(naggies.map(n => ({ key: n.key, isApproving: false })));
                }
            }
        ]);
    }

    const nagUser = (naggie, rowMap) => {
        rowMap[naggie.key].closeRow();
        openNewNag(naggie);
    }

    const seeUsersNag = (naggie, rowMap) => {
        rowMap[naggie.key].closeRow();
        currentChanged('nags');
    }

    const naggieRow = ({item: naggie}) => {
        return (
            <Box>
                <Box pl="4" pr="5" py="2" bg="dark.200" borderWidth={1} borderColor="blueGray.800">
                    <HStack alignItems="center" space={3}>
                        <Avatar size="xl" source={images[naggie.name]} />
                        <VStack>
                            <Heading bold fontSize="lg">
                                {naggie.name}
                            </Heading>
                            <Text>{descriptions[naggie.name]}</Text>
                        </VStack>
                        <Spacer />
                        { naggie.needsApproval && (
                            <Text fontSize="xs" fontWeight="medium">
                                Needs Approval
                            </Text>
                        )}
                        { isApproving.some(n => n.key === naggie.key) && isApproving.find(n => n.key === naggie.key).isApproving && (
                            <Spinner size="sm" />
                        )}
                        {!naggie.needsApproval && (
                            <HStack space={5}>
                                <VStack alignItems="center">
                                    <Text>{nags.filter(x => x.assignedToName === naggie.name).length || 0} assigned</Text>
                                    <Icon as={<MaterialCommunityIcons name="account-alert" />} size="sm" />
                                </VStack>
                                <VStack alignItems="center">
                                    <Text>{nags.filter(x => x.assignedToName == naggie.name && x.awaitingApproval).length || 0 } done</Text>
                                    <Icon as={<MaterialIcons name="approval" />} size="sm" />
                                </VStack>
                            </HStack>
                        )}
                    </HStack>
                </Box>
            </Box>
        );
    };

    const naggieApproval = ({ item: naggie }, rowMap) => {
        return (
            <HStack flex={1} pl={2}>
                <Pressable
                    w="65"
                    ml="auto"
                    bg="green.600"
                    justifyContent="center"
                    _pressed={{ opacity: 0.5 }}
                    onPress={() => approveUser(naggie, rowMap)}
                >
                    <VStack alignItems="center" space={2}>
                        <Icon as={<Entypo name="check" />} size="sm" />
                        <Text fontSize="sm" fontWeight="medium">Approve</Text>
                    </VStack>
                </Pressable>
                <Pressable
                    w="70"
                    bg="red.400"
                    justifyContent="center"
                    _pressed={{ opacity: 0.5 }}
                    onPress={() => denyUser(naggie, rowMap)}
                >
                    <VStack alignItems="center" space={2}>
                        <Icon as={<FontAwesome name="close" />} size="sm" />
                        <Text fontSize="sm" fontWeight="medium">Deny</Text>
                    </VStack>
                </Pressable>
            </HStack>
        );
    }

    const naggieNag = ({item: naggie }, rowMap) => {
        return (
            <HStack flex={1} pl={2}>
                <Pressable
                    w="65"
                    ml="auto"
                    bg="fuchsia.900"
                    justifyContent="center"
                    _pressed={{ opacity: 0.5 }}
                    onPress={() => nagUser(naggie, rowMap)}
                >
                    <VStack alignItems="center" space={2}>
                        <Icon as={<MaterialCommunityIcons name="account-alert" />} size="sm" />
                        <Text fontSize="sm" fontWeight="medium">Nag</Text>
                    </VStack>
                </Pressable>
                <Pressable
                    w="70"
                    bg="fuchsia.600"
                    justifyContent="center"
                    _pressed={{ opacity: 0.5 }}
                    onPress={() => seeUsersNag(naggie, rowMap)}
                >
                    <VStack alignItems="center" space={2}>
                        <Icon as={<MaterialIcons name="approval" />} size="sm" /> 
                        <Text fontSize="sm" fontWeight="medium">See nags</Text>
                    </VStack>
                </Pressable>
            </HStack>
        );
    }

    const naggieHiddenRow = (data, rowMap) => {
        if (data.item.needsApproval)
            return naggieApproval(data, rowMap);

        return naggieNag(data, rowMap);
    }

    if (!naggies || !naggies.length) {
        return (
            <Center>
                <VStack>
                    <Heading>Get them bitches to install the app</Heading>
                    <Icon w="full" as={<Entypo name="users" />} size="100" mt={10} alignSelf="center" />
                </VStack>
            </Center>
        );
    }

    return (
        <Box safeArea flex={1}>
            <SwipeListView
                data={naggies}
                renderItem={naggieRow}
                renderHiddenItem={naggieHiddenRow}
                rightOpenValue={-135}
                previewRowKey={'0'}
                previewOpenValue={-40}
                previewOpenDelay={3000}
            />
        </Box>
    )
}