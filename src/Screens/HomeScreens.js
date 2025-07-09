import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import { Button} from 'react-native-paper';
import Assistente from '../Componentes/Assistente';
import {api} from '../Services/api';

import ObraItem from '../Componentes/ObraItem'

export default function HomeScreen({navigation}) {
    const [obras, setObras] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchObras = async () => {
        setLoading(true);
        
        try{
            const response = await api.get('/api/obras');
            setObras(response.data);
        }catch (error){
            alert('Error ao buscar obras')
        }  finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchObras);
        return unsubscribe;
    }, [navigation]);

    return(
        <View style={styles.container}>

        <Button 
            mode="contained"
            icon="plus"
            style={styles.btn}
            title="Nova Obra" onPress={() => navigation.navigate('NovaObra')}
            > Nova Obra 
        </Button>
            
            {loading ? (
                <Text>Carregando...</Text>
            ):(
                <FlatList
                data={obras}
                keyExtractor={item => item._id}
                contentContainerStyle={{ paddingBottom: '40%' }}
                renderItem={({ item }) => (
                    
                <ObraItem
                    obra={item}
                    onPress={() => navigation.navigate('DetalhesObra', { obraId: item._id })} />
                )}
            />
            )}
             <Assistente/>
        </View>
    )

}
const styles = StyleSheet.create({
    container:{
        flex: 1,
        padding: 10,
        backgroundColor: '#F4F6F6',
    },
    btn:{
    marginHorizontal: 5,
    marginBottom: 18,
    marginTop:10,
    width:'35%',
    marginLeft: '61%',
    backgroundColor: '#A34003',
    borderRadius: 8,
  }
})