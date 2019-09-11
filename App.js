import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Vibration,
  Alert
} from "react-native";
import * as Permissions from "expo-permissions";
import { Camera } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import CaptureButton from "./component/CaptureButton";

const Clarifai = require("clarifai");

// Initialise Clarifai api
const clarifaiApp = new Clarifai.App({
  apiKey: "b748346be29c43c3be4e9411ec487def"
});

export default class CameraExample extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasCameraPermission: null,
      type: Camera.Constants.Type.back,
      ratio: "16:9",
      ratios: [],

      identifiedAs: "",
      loading: false
    };
  }

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === "granted" });
  }

  takePicture = async () => {
    try {
      if (this.camera) {
        await this.camera.pausePreview.bind(this);

        const options = {
          base64: true
        };

        this.setState({
          loading: true
        });

        const data = await this.camera.takePictureAsync(options);

        this.setState({
          processing: true
        });

        Vibration.vibrate(10);

        await this.identifyImage(data.base64);
      }
    } catch (_err) {
      console.error(_err);
      this.setState({
        loading: false,
        processing: false
      });
    }
  };

  async identifyImage(imageData) {
    // Identify the image

    try {
      const response = await clarifaiApp.models.predict(
        Clarifai.GENERAL_MODEL,
        {
          base64: imageData
        }
      );
      const results = response.outputs;
      if (results && results.length) {
        return this.displayAnswer(results[0]);
      } else {
        alert("No se encontraron resultados");
      }
    } catch (_err) {
      console.error(_err);
    } finally {
      this.camera.resumePreview.bind(this);
      this.setState({ loading: false, processing: false });
    }
  }

  displayAnswer(result) {
    const concepts = result.data.concepts;
    console.log(concepts);
    const conceptsNames = concepts.map(c => {
      return `${c.name} -> ${Math.round(c.value * 100)}%`;
    });
    // Dismiss the acitivty indicator
    this.setState(
      {
        identifedAs: concepts,
        loading: false
      },
      () => {
        // Show an alert with the answer on
        Alert.alert("Result", conceptsNames.join(", "));
      }
    );
  }

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
          {this.state.loading && this.state.processing ? (
            <View
              style={[
                StyleSheet.absoluteFillObject,
                {
                  zIndex: 999,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  justifyContent: "center",
                  alignItems: "center"
                }
              ]}
            >
              <ActivityIndicator
                size="large"
                style={styles.loadingIndicator}
                color="#fff"
                animating={this.state.loading}
              />
            </View>
          ) : null}
          <Camera
            ref={ref => {
              this.camera = ref;
            }}
            style={{ flex: 1 }}
            type={this.state.type}
          >
            <View style={{ flex: 0.03, backgroundColor: "black" }}></View>
            <View style={styles.topBar}>
              <Text style={{ color: "white", fontSize: 40 }}>ChocoSearch</Text>
            </View>
            <View style={styles.bottomBar}>
              <View
                style={{
                  flex: 0.6,
                  justifyContent: "flex-end",
                  marginBottom: 35
                }}
              >
                <ActivityIndicator
                  size="large"
                  style={styles.loadingIndicator}
                  color="#fff"
                  animating={this.state.loading}
                />
                <CaptureButton
                  buttonDisabled={this.state.loading}
                  onClick={this.takePicture.bind(this)}
                />
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
    backgroundColor: "#000"
  },
  camera: {
    flex: 1,
    justifyContent: "space-between"
  },
  topBar: {
    marginTop: 0,
    flex: 0.07,
    backgroundColor: "#B25B00", //Change the color
    flexDirection: "row",
    justifyContent: "space-around"
  },
  bottomBar: {
    backgroundColor: "transparent", //Change the color
    alignSelf: "flex-end",
    justifyContent: "space-between",
    flex: 1,
    flexDirection: "row"
  },
  noPermissions: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10
  },
  toggleButton: {
    flex: 0.25,
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 20,
    padding: 5,
    alignItems: "center",
    justifyContent: "center"
  },
  bottomButton: {
    flex: 0.3,
    height: 58,
    justifyContent: "center",
    alignItems: "center"
  },
  row: {
    flexDirection: "row"
  }
});
