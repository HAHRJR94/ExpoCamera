import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';
import {
  Ionicons,
  MaterialIcons,
  Foundation,
  MaterialCommunityIcons
} from '@expo/vector-icons';

export default class CameraExample extends React.Component {
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
    ratio: '16:9',
    ratios: []
  };

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  takePicture = () => {
    if (this.camera) {
      this.camera.takePictureAsync({ onPictureSaved: this.onPictureSaved });
    }
  };
  
  getRatios = async () => {
    const ratios = await this.camera.getSupportedRatios();
    return ratios;
  };

  setRatio = ratio => this.setState({ ratio });  

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={styles.container}>
          <Camera style={{ flex: 1 }} type={this.state.type}>
            <View style={{flex:0.03, backgroundColor: "black"}}></View>
            <View
              style={styles.topBar}>
              <Text style={{ color: 'white', fontSize: 40 }}>
                ChocoSearch
              </Text>
            </View> 
            <View style={styles.bottomBar}>
              <View style={{ flex: 0.6, justifyContent: 'flex-end', marginBottom: 35 }}>
                <TouchableOpacity onPress={this.takePicture} >
                  <Ionicons name="ios-camera" size={70} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </Camera>
        </View>
      );
    }
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    marginTop: 0,
    flex: 0.07,
    backgroundColor: '#B25B00', //Change the color
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  bottomBar:{
    backgroundColor: 'transparent', //Change the color
    alignSelf: 'flex-end',
    justifyContent: 'space-between',
    flex: 1,
    flexDirection: 'row',
  },
  noPermissions: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  toggleButton: {
    flex: 0.25,
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 20,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomButton: {
    flex: 0.3,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
})