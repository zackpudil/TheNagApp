import { AntDesign, FontAwesome5, Ionicons, MaterialIcons, Octicons } from '@expo/vector-icons';
import { Avatar, Box, Button, HStack, Icon, VStack, Text, Pressable, Spinner, Spacer, Heading, Center, Menu, IconButton } from 'native-base';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { deleteChore } from '../../utils/chores';

const images = {
    zack: require('../../assets/zack.jpg'),
    mike: require('../../assets/mike.jpg'),
    gabe: require('../../assets/gabe.jpg')
};

export default function Chores({ chores, openNewChore }) {

    const [isDeleteLoading, setIsDeleteLoading] = useState(chores.map(chore => ({ key: chore.key, isDeleteLoading: false })));
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [choresFilter, setChoresFilter] = useState('all');
    const [filteredChores, setFilteredChores] = useState(chores);


    useEffect(() => {
        switch(choresFilter) {
            case 'daily':
            case 'weekly':
            case 'monthly':
                setFilteredChores(chores.filter(x => x.choreType == choresFilter));
                break;
            case 'all':
            default:
                setFilteredChores([...chores]);
        }
    }, [chores, choresFilter])

    const onPressDeleteChore = async (chore) => {
        setIsDeleteLoading(isDeleteLoading.map(x => {
            if (x.key == chore.key) return { key: x.key, isDeleteLoading: true };
            return x;
        }))
        deleteChore(chore._id);
    }

    const renderChore = ({ item: chore }) => {
        return (
            <Box>
                <Box pl="4" pr="5" py="2" bg="dark.200" borderColor="blueGray.800" borderWidth={1}>
                    <HStack alignItems="center" space={3}>
                        { chore.choreType === 'daily' && <Icon size="lg" as={<FontAwesome5 name="calendar-day" />} /> }
                        { chore.choreType === 'weekly' && <Icon size="lg" as={<FontAwesome5 name="calendar-week" />} /> }
                        { chore.choreType === 'monthly' && <Icon size="lg" as={<FontAwesome5 name="calendar-alt" />} /> }
                        <VStack alignItems="flex-start">
                            <Text numberOfLines={1} fontSize={18} maxW={200}>{chore.nagTitle}</Text>
                            <Text>{chore.choreType}</Text>
                        </VStack>
                        <Spacer />
                        <Avatar size="lg" source={chore.isAssigned ? images[chore.assignedToName] : require('../../assets/idiots.jpg')} />
                    </HStack>
                </Box>
            </Box>
        );
    };

    const renderChoreHidden = ({ item: chore }, rowMap) => {
        return (
            <HStack flex={1} pl={2}>
                <Pressable
                    w="65"
                    ml="auto"
                    bg="orange.400"
                    justifyContent="center"
                    _pressed={{opacity: 0.5}}
                    onPress={() => Alert.alert("TBD", "Featre will be in next release, or never.", [{ text: 'Okay', style: 'cancel'}])}
                >
                    <VStack alignItems="center" space={2}>
                        <Icon as={<MaterialIcons name="assignment-ind" />} />
                        <Text fontSize="sm" fontWeight="medium">Re-assign</Text>
                    </VStack>
                </Pressable>
                <Pressable
                    w="70"
                    bg="red.400"
                    justifyContent="center"
                    _pressed={{opacity: 0.5}}
                    onPress={() => onPressDeleteChore(chore)}
                >
                    <VStack alignItems="center" space={2}>
                        { (isDeleteLoading.some(d => d.key === chore.key) && isDeleteLoading.find(d => d.key === chore.key).isDeleteLoading) && (
                            <Spinner size="lg" alignSelf="center" />
                        )}
                        { (!isDeleteLoading.some(d => d.key === chore.key) || !isDeleteLoading.find(d => d.key === chore.key).isDeleteLoading) && (
                            <>
                                <Icon as={<AntDesign name="delete" />} />
                                <Text fontSize="sm" fontWeight="medium">Delete</Text>
                            </>
                        )}
                    </VStack>
                </Pressable>
            </HStack>
        );
    }

    return (
        <Box w="full" flex={1} safeArea>
            {(!!filteredChores && !!filteredChores.length) && (
                <SwipeListView
                    data={filteredChores}
                    renderItem={renderChore}
                    renderHiddenItem={renderChoreHidden}
                    rightOpenValue={-135}
                    previewRowKey={'0'}
                    previewOpenValue={-40}
                    previewOpenDelay={3000}
                />
            )}
            {(!chores || !chores.length) && (
                <Center>
                    <Heading>No Chores</Heading>
                    <Text>Create some chores ya bish</Text>
                </Center>
            )}
            <HStack alignItems="center" space={1}>
                <Button flexGrow={20} bg="emerald.400" onPress={openNewChore} leftIcon={<Icon as={<AntDesign name="plus" />} />}>
                    New Chore
                </Button>
                <Menu
                    isOpen={isMenuOpen}
                    onOpen={() => setIsMenuOpen(true)}
                    onClose={() => setIsMenuOpen(false)}
                    offset={-20}
                    crossOffset={-100}
                    placement="top left"
                    trigger={(triggerProps) => {
                        return (
                            <IconButton bg={choresFilter === 'all' ? 'violet.700' : 'orange.400'} {...triggerProps} icon={<Icon as={<Ionicons name="filter" />} />} />
                        )
                    }}
                >
                    <Menu.Item onPress={() => setChoresFilter("all")}>
                        <HStack alignItems="center" space={1}>
                            <Icon size="lg" as={<FontAwesome5 name="calendar" />} />
                            <Text>All</Text>
                        </HStack>
                    </Menu.Item>
                    <Menu.Item onPress={() => setChoresFilter("daily")}>
                        <HStack alignItems="center" space={1}>
                            <Icon size="lg" as={<FontAwesome5 name="calendar-day" />} /> 
                            <Text>Daily</Text>
                        </HStack>
                    </Menu.Item>
                    <Menu.Item onPress={() => setChoresFilter("weekly")}>
                        <HStack alignItems="center" space={1}>
                            <Icon size="lg" as={<FontAwesome5 name="calendar-week" />} /> 
                            <Text>Weekly</Text>
                        </HStack>
                    </Menu.Item>
                    <Menu.Item onPress={() => setChoresFilter("monthly")}>
                        <HStack alignItems="center" space={1}>
                            <Icon size="lg" as={<FontAwesome5 name="calendar-alt" />} /> 
                            <Text>Monthly</Text>
                        </HStack>
                    </Menu.Item>
                </Menu>
            </HStack>
        </Box>
    );
}