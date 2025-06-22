import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { Button, Card } from 'react-native-paper';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { api } from '../Services/api';

export default function Fiscalizacao({ navigation, route }) {
    const [data, setData] = useState('');
    const [status, setStatus] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [localizacao, setLocalizacao] = useState(null);
    const [nomeLocal, setNomeLocal] = useState('');
    const [foto, setFoto] = useState(null);
    const { obraId } = route.params;

    useEffect(() => {
        (async () => {
            // Solicitar permissões de localização
            const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
            if (locStatus !== 'granted') {
                Alert.alert('Permissão negada', 'Permissão para acessar a localização é necessária!');
            } else {
                const location = await Location.getCurrentPositionAsync({});
                const coords = {
                    lat: location.coords.latitude,
                    lng: location.coords.longitude,
                };
                setLocalizacao(coords);

                const reverseGeocode = await Location.reverseGeocodeAsync({
                    latitude: coords.lat,
                    longitude: coords.lng,
                });

                if(reverseGeocode.length > 0) {
                    const { street, name, region, district, postalCode} = reverseGeocode[0];
                    setNomeLocal(`${street || name} - ${district || streetNumber} , ${region} - ${postalCode}`);
                } else {
                    setNomeLocal('Endereço não encontrado');
                }
            }

            // Solicitar permissões de mídia
            const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (mediaStatus !== 'granted') {
                Alert.alert('Permissão necessária', 'Precisamos acessar sua galeria para adicionar fotos!');
            }
        })();
    }, []);

    const selecionarFoto = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets[0].base64) {
                setFoto('data:image/jpg;base64,' + result.assets[0].base64) ;
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível selecionar a imagem');
        }
    };

    const tirarFoto = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets[0].base64) {
                setFoto('data:image/jpg;base64,' + result.assets[0].base64);
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível tirar a foto');
        }
    };

    const salvarFiscalizacao = async () => {
        if (!data || !status || !localizacao) {
            Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
            return;
        }
         const partes = data.split('/');
         const dataFormatada = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);

        try {
            await api.post('/api/fiscalizacoes', {
                data: dataFormatada,
                status,
                observacoes,
                localizacao: {
                lat: Number(localizacao.lat),
                lng: Number(localizacao.lng)
            },
            endereco: nomeLocal,
                foto,
                obra: obraId,
            });
            Alert.alert('Sucesso', 'Fiscalização cadastrada!');
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Falha ao salvar fiscalização');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.buttonGroup}>
            <Button
                mode="contained"
                icon="camera"
                onPress={tirarFoto}
                style={styles.btn}>
                    Tirar Foto
            </Button>
            
                <Button
                    mode="contained"
                    icon="image"
                    onPress={selecionarFoto}
                    style={styles.btn}>
                    Galeria
                </Button>
            
        </View>


            <Text>Data da Fiscalização</Text>
            <TextInput 
                style={styles.input} 
                value={data} 
                onChangeText={setData}
                placeholder="DD/MM/AAAA"
            />

           <Text>Status</Text>
            <Picker
                selectedValue={status}
                onValueChange={(itemValue) => setStatus(itemValue)}
                style={styles.picker}
            >
                <Picker.Item label="Selecione o status" value="" />
                <Picker.Item label="Pendente" value="pendente" />
                <Picker.Item label="Em andamento" value="em-andamento" />
                <Picker.Item label="Concluído" value="concluido" />
                <Picker.Item label="Atrasado" value="atrasado" />
            </Picker>
            <Text>Observações</Text>
            <TextInput 
                style={[styles.input, { height: 100 }]} 
                value={observacoes} 
                onChangeText={setObservacoes} 
                multiline 
                placeholder="Descreva as observações da fiscalização"
            />

            <Text>Foto da fiscalização:</Text>
                {foto && (
                    <Card style={styles.card}>
                        <Card.Cover source={{ uri: foto }} style={styles.foto} />
                    </Card>
                )}

             <Text>Localização:</Text>
                <TextInput
                style={styles.input}
                value={nomeLocal}
                onChangeText={setNomeLocal}
                placeholder="Digite o endereço"
                />

            {localizacao && (
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: localizacao.lat,
                        longitude: localizacao.lng,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                >
                    <Marker
                        coordinate={{
                            latitude: localizacao.lat,
                            longitude: localizacao.lng,
                        }}
                        title="Local da fiscalização"
                        description={nomeLocal}
                    />
                </MapView>
            )}

            <View>
                <Button 
                    mode="contained"
                    icon="content-save"
                    onPress={salvarFiscalizacao}
                    style={styles.btn}
                    > Salvar Fiscalizaçâo
                </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#aaa',
        padding: 10,
        marginVertical: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    map: {
        height: 200,
        width: '100%',
        marginVertical: 10,
        borderRadius: 10,
    },
    picker: {
        height: 60,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#aaa',
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    foto: {
        width: '100%',
        height: 250,
        marginBottom: 10,
        marginTop: 10,
        borderRadius: 4,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 15,
    },
    localizacao: {
        marginVertical: 8,
        color: '#555',
    },
});