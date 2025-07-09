import React from "react";
import { View, Text, StyleSheet, Image } from 'react-native';


const formatDate = (dateStr) => {
    if (!dateStr) return 'Não definida';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

export default function FiscalizacaoItem({ fiscalizacao}){
    return (
        <View style={styles.container}>
            {fiscalizacao.foto ? <Image source={{ uri: fiscalizacao.foto}} style={styles.image}/> : null}
            <View style={styles.info}>
                <Text> 📅 Data: {formatDate(fiscalizacao.data)}</Text>
                <Text> 📋 Status: {fiscalizacao.status}</Text>
                <Text> 📝 Observações: {fiscalizacao.observacoes || 'Nenhuma'}</Text>
                <Text> 📍 Local: {fiscalizacao.endereco} </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container:{
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        marginVertical: 6,
        borderRadius: 6,
        overflow: 'hidden',
    },
    image: {
       width: '25%',
        height:'85%',
        marginLeft: 10,
        marginTop:10,
    },
    info: {
        flex: 1,
        padding: 8,
    },
    title:{
        fontWeight: 'blod',
    },
});