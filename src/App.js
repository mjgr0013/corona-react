import React, {Component} from 'react';
import Chart from "chart.js";
import {pluck} from "underscore";
import timeseries from "./data/timeseries";
import Grid from "@material-ui/core/Grid";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

class App extends Component {
  chartRef = React.createRef();

  state = {
    countries: [],
    country: null,
    slice: 30,
    completeData: null,
    data: null,
    chart: null,
    visualization: 'increment',
    deathsDataset: true,
    confirmedDataset: false,
    recoveredDataset: false
  }

  updateGraph() {
    let {slice, data, deathsDataset, confirmedDataset, recoveredDataset, visualization} = this.state;
    let datasets = [];

    let labels = pluck(data, 'date').slice(-slice)

    if (confirmedDataset) {
      let confirmed = this.fetchDataByVisualization(this.state.data, 'confirmed', visualization).slice(-slice)

      datasets.push({
        label: 'Confirmed',
        borderColor: 'rgba(234, 237, 54)',
        backgroundColor: 'rgba(234, 237, 54)',
        data: confirmed,
        fill: false,
      })
    }

    if (deathsDataset) {
      let deaths = this.fetchDataByVisualization(this.state.data, 'deaths', visualization).slice(-slice)

      datasets.push({
        label: 'Deaths',
        borderColor: 'rgb(237,106,54)',
        backgroundColor: 'rgb(237,106,54)',
        data: deaths,
        fill: false,
      })
    }

    if (recoveredDataset) {
      let recovered = this.fetchDataByVisualization(this.state.data, 'recovered', visualization).slice(-slice)

      datasets.push({
        label: 'Recovered',
        borderColor: 'rgb(72,237,54)',
        backgroundColor: 'rgb(72,237,54)',
        data: recovered,
        fill: false,
      })
    }

    var config = {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        title: {
          display: true,
          text: 'Daily general report COVID-19'
        },
        tooltips: {
          mode: 'index',
          intersect: false,
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Date'
            }
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Value'
            }
          }]
        }
      }
    };

    const myChartRef = this.chartRef.current.getContext("2d");

    if (this.state.chart) {
      this.state.chart.destroy()
    }

    let chart = new Chart(myChartRef, config);

    this.state.chart = chart
  }

  fetchData() {
    fetch('https://pomber.github.io/covid19/timeseries.json')
        .then(response => {
          return response.json();
        })
        .then(myJson => {
          this.setState({
            completeData: myJson,
            data: this.buildFormattedData(myJson['Spain']),
            countries: Object.keys(myJson)
          })
        });

    /*this.setState({
      completeData: timeseries,
      data: this.buildFormattedData(timeseries[this.state.country]),
      countries: Object.keys(timeseries)
    })*/
  }

  fetchDataByVisualization(data, value, visualization) {
    return data.map(e => {
      return e[value][visualization];
    })
  }

  buildFormattedData(data) {
    return data.map((e, index) => {
      let previousElement = data[index - 1] !== undefined ? data[index - 1] : null

      return {
        date: e.date,
        deaths: this.buildDataForKey(previousElement, "deaths", e),
        recovered: this.buildDataForKey(previousElement, "recovered", e),
        confirmed: this.buildDataForKey(previousElement, "confirmed", e),
      };
    })
  }

  buildDataForKey(previousValue, keyName, currentValue) {
    if (!previousValue)
      return {absolute: currentValue[keyName], percent: 0, increment: 0};

    let increment = currentValue[keyName] - previousValue[keyName];
    let percentIncrement = parseFloat((increment / previousValue[keyName] * 100).toFixed(3))

    return {absolute: currentValue[keyName], percent: percentIncrement, increment: increment};
  }

  componentDidMount() {
    fetch('https://ipapi.co/json/')
        .then(response => {
          return response.json();
        })
        .then(myJson => {
          this.state.country = myJson.country_name;
          this.fetchData()
        })
  }

  changeCountry = e => {
    console.log("cambio country")
    this.setState({
      country: e.target.value,
      data: this.buildFormattedData(this.state.completeData[e.target.value]),
    })
  }

  changeDays = e => {
    this.setState({
      slice: e.target.value
    })
  }

  switchDeathsDataset = e => {
    this.setState({
      deathsDataset: e.target.checked
    })
  }

  switchConfirmedDataset = e => {
    this.setState({
      confirmedDataset: e.target.checked
    })
  }

  switchRecoveredDataset = e => {
    this.setState({
      recoveredDataset: e.target.checked
    })
  }

  handleVisualizationChange = e => {
    this.setState({
      visualization: e.target.value
    })
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.updateGraph()
  }

  render() {
    return (
        <div>
          <Grid container spacing={2} justify={"space-around"} alignItems={"center"} mb={2}>
            <FormControlLabel
                control={
                  <Checkbox
                      checked={this.state.deathsDataset}
                      name="deathsDataset"
                      color="primary"
                      onChange={this.switchDeathsDataset}
                  />
                }
                label="Deaths"
            />

            <FormControlLabel
                control={
                  <Checkbox
                      checked={this.state.recoveredDataset}
                      name="recoveredDataset"
                      color="primary"
                      onChange={this.switchRecoveredDataset}
                  />
                }
                label="Recovered"
            />

            <FormControlLabel
                control={
                  <Checkbox
                      checked={this.state.confirmedDataset}
                      name="confirmedDataset"
                      color="primary"
                      onChange={this.switchConfirmedDataset}
                  />
                }
                label="Confirmed"
            />
          </Grid>
          <Grid container spacing={2} justify={"space-around"} alignItems={"center"}>
            <FormControl
                size={"medium"}
            >
              <InputLabel id="select-country">Country</InputLabel>
              <Select
                  labelId="select-country"
                  id="select-country"
                  value={this.state.country}
                  onChange={this.changeCountry}
              >
                {this.state.countries.map(e => {
                  return <MenuItem key={e} value={e}>{e}</MenuItem>
                })}
              </Select>
            </FormControl>

            <FormControl
                size={"medium"}
            >
              <InputLabel id="select-visualization">Visualization</InputLabel>
              <Select
                  labelId="select-visualization"
                  id="select-visualization"
                  value={this.state.visualization}
                  onChange={this.handleVisualizationChange}
              >
                <MenuItem key={0} value={"absolute"}>Absolute</MenuItem>
                <MenuItem key={1} value={"percent"}>Percent</MenuItem>
                <MenuItem key={2} value={"increment"}>Increment</MenuItem>
              </Select>
            </FormControl>

            <TextField size={"medium"} id="standard-required" label="Latest N days" value={this.state.slice}
                       onChange={this.changeDays}/>
          </Grid>

          <Grid container spacing={2} justify={"space-around"} alignItems={"center"}>
            <canvas id="canvas" ref={this.chartRef}>
            </canvas>
          </Grid>
        </div>
    )
  }
}

export default App;
