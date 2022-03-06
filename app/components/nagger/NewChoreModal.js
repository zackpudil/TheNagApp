import React, { useState } from 'react';
import { Button, Modal, ScrollView, Select, VStack, Input, Image, Badge, Avatar, HStack, Heading, useToast } from 'native-base';
import { Pressable } from 'react-native';
import { createChore } from '../../utils/chores';

const images = {
    zack: require('../../assets/zack.jpg'),
    mike: require('../../assets/mike.jpg'),
    gabe: require('../../assets/gabe.jpg')
};

export default function NewChoreModal({ isOpen, onClose, naggies }) {
    const [loading, setLoading] = useState(false);
    const [choreTitle, setChoreTitle] = useState('');
    const [choreType, setChoreType] = useState(null);
    const [naggieAssigned, setNaggieAssigned] = useState(null);

    const toast = useToast();

    const onPressCreateNag = async () => {
        setLoading(true);
        await createChore({
            nagTitle: choreTitle,
            choreType: choreType,
            isAssigned: naggieAssigned != null,
            assignedToName: naggieAssigned?.name,
            assignedToDeviceToken: naggieAssigned?.deviceToken
        });
        toast.show({
            title: 'Chore created',
            status: 'success',
            duration: 3000,
            placement: 'top'
        });
        onClose();
        setLoading(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="full">
            <Modal.Content>
                <Modal.CloseButton />
                <Modal.Header>Auto nags, its the future</Modal.Header>
                <Modal.Body>
                    <VStack space={4} alignItems="center">
                        <Input
                            autoCorrect={false}
                            placeholder="Chore Desc"
                            size="lg"
                            w={300}
                            value={choreTitle}
                            onChangeText={(text) => setChoreTitle(text)}
                        />
                        <Select
                            w={300}
                            style={{fontSize: 16}}
                            placeholder="Choose Frequency"
                            selectedValue={choreType}
                            onValueChange={(value) => setChoreType(value)}
                        >
                            <Select.Item label="Daily" value="daily" />
                            <Select.Item label="Weekly" value="weekly" />
                            <Select.Item label="Montly" value="monthly" />
                        </Select>
                        <Heading>Assigned To: </Heading>
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
                </Modal.Body>
                <Modal.Footer>
                    <Button.Group space={2}>
                        <Button onPress={onClose}>Cancel</Button>
                        <Button onPress={onPressCreateNag} isLoading={loading}>Create Chore</Button>
                    </Button.Group>
                </Modal.Footer>
            </Modal.Content>
        </Modal>
    )
}