import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity  } from 'react-native';


const formatDate = (dateStr) => {
    if (!dateStr) return 'Não definida';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

export default function ObraItem({ obra, onPress }){
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.shadow}>
            <View style={styles.container}>
                {obra.foto && <Image source={{ uri: obra.foto }} style={styles.image} />}
                <View style={styles.info}>
                    <Text style={styles.info}>{obra.nome}</Text>
                    <Text style={styles.text}> 👷 Responsável: {obra.responsavel}</Text>

                    <Text style={styles.text}> 📅 Início: {formatDate(obra.dataInicio)}</Text>

                    <Text style={styles.text}> ⏳ Previsão de Término: {obra.dataFim ? formatDate(obra.dataFim) : 'Não definida'}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
    },
    shadow:{
        marginVertical: 8,
        backgroundColor: '#fff',
        marginHorizontal: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        borderRadius: 10,
        shadowOffset: { width: 0, height: 1},
        elevation: 5,
    },
    image: {
        width: '25%',
        height:'85%',
        marginLeft: 10,
        marginTop:10,
        },
    info: {
        padding: 10,
        flex: 1,
    },
    title:{
        fontWeight: 'bold',
        fontSize: 17,
        marginBottom: 4,
        color: '#333',
    },
    text: {
        fontSize: 14,
        color: '#555',
        marginBottom: 2,
    }
});