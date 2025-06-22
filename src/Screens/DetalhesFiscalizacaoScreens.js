import React, { useState ,useCallback } from 'react';
import { View, Text, Image,StyleSheet, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Button, Card} from 'react-native-paper';
import { useNavigation, useRoute, useFocusEffect} from '@react-navigation/native';
import { api } from '../Services/api';

export default function DetalhesFiscalizacao(){
    const navigation = useNavigation();
    const route = useRoute();

    const [ fiscalizacao, setFiscalizacao ] = useState(route.params.fiscalizacao);

    useFocusEffect(
        useCallback(() => {
            const fetchFiscalizacoes = async () => {
                try {
                    const response = await api.get(`/api/fiscalizacoes/${fiscalizacao._id}`);
                    setFiscalizacao(response.data);
                } catch (error) {
                    console.error('Erro ao carregar fiscalização:', error);
                }
            };
            fetchFiscalizacoes();
        }, [fiscalizacao._id])
    );

    const handleExcluir = async () => {
        try{
            await api.delete(`/api/fiscalizacoes/${fiscalizacao._id}`);
            navigation.goBack();
        }  catch (error) {
            Alert.alert('Error', 'Não foi possível excluir');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Não definida';
        const d = new Date(dateStr);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    return(
        <View style={styles.container}>
    <View>
        <Button
        icon="pencil"
        mode="contained"
        onPress={() => navigation.navigate('EditarFiscalizacao', { fiscalizacao })}
        style={styles.btn}
        >
          Editar
        </Button>
    </View>
    
    {fiscalizacao.foto && (
    <Image source={{ uri: fiscalizacao.foto}} style={styles.img}></Image>
    )}
    <Card style={styles.Card}>
        <Card.Content>
            <Text style={styles.title}>Status: {fiscalizacao.status}</Text>
            <Text> 📅 Data: {formatDate(fiscalizacao.data)}</Text>
            <Text> 📝 Observações: {fiscalizacao.observacoes || 'Nenhuma'}</Text>
            <Text> 📍 Endereço: {fiscalizacao.endereco}</Text>

            {fiscalizacao.localizacao && (
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: fiscalizacao.localizacao.lat,
                    longitude: fiscalizacao.localizacao.lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                >
                <Marker
                    coordinate={{
                    latitude: fiscalizacao.localizacao.lat,
                    longitude: fiscalizacao.localizacao.lng,
                    }}
                    title="Local Fiscalização"
                />
            </MapView>
            )} 
      </Card.Content>
    </Card>
    <View>
    <Button
        icon="delete"
        mode="contained"
        onPress={() => 
            Alert.alert(
                'Confirmar exclusão',
                'Tem certeza que deseja excluir esta fiscalização?',
                [
                    {
                        text: 'Cancelar',
                        style: 'cancel'
                    },
                    {
                        text: 'Excluir',
                        onPress: handleExcluir,
                        style: 'destructive'
                    }
                ]
            )
        }
        buttonColor="#B00020"
        style={styles.btn}>
        Excluir
    </Button>
    </View>
</View>
    )
}

const styles = StyleSheet.create({
    container :{
        padding: 15,
        flex: 1,
    },
    img:{
        width: '100%',
        height: 200,
        marginBottom: 20,
        borderRadius: 8
    },
    map:{
        width: '100%',
        height: 200,
        marginVertical: 10,
        borderRadius: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    btn: {
        marginTop: 15,
        marginBottom: 10,
        width:'40%',
        marginLeft: '60%'
    },
});