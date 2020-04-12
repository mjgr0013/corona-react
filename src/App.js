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

class App extends Component {
  chartRef = React.createRef();

  state = {
    countries: [],
    country: 'Spain',
    slice: 30,
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
    /*fetch('https://pomber.github.io/covid19/timeseries.json')
        .then(response => {
          return response.json();
        })
        .then(myJson => {
          this.setState({
            data: this.buildFormattedData(myJson['Spain'])
          }, () => {
            this.updateGraph()
          })
        });*/

    this.setState({
      data: this.buildFormattedData(timeseries[this.state.country]),
      countries: Object.keys(timeseries)
    })
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
    this.fetchData()
  }

  changeCountry = e => {
    console.log("cambio country")
    this.setState({
      country: e.target.value
    }, () => {
      //this.fetchData()
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
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <FormControlLabel
                control={
                  <Checkbox
                      checked={this.state.deathsDataset}
                      name="checkedB"
                      color="primary"
                      onChange={this.switchDeathsDataset}
                  />
                }
                label="Deaths"
            />
          </Grid>
          <Grid item xs={4}>
            <FormControlLabel
                control={
                  <Checkbox
                      checked={this.state.recoveredDataset}
                      name="checkedB"
                      color="primary"
                      onChange={this.switchRecoveredDataset}
                  />
                }
                label="Recovered"
            />
          </Grid>
          <Grid item xs={4}>
            <FormControlLabel
                control={
                  <Checkbox
                      checked={this.state.confirmedDataset}
                      name="checkedB"
                      color="primary"
                      onChange={this.switchConfirmedDataset}
                  />
                }
                label="Confirmed"
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl
                fullWidth
            >
              <InputLabel id="demo-simple-select-label">Visualization</InputLabel>
              <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={this.state.country}
                  onChange={this.changeCountry}
              >
                {this.state.countries.map(e => {
                  return <MenuItem key={e} value={e}>{e}</MenuItem>
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl
                fullWidth
            >
              <InputLabel id="demo-simple-select-label">Visualization</InputLabel>
              <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={this.state.visualization}
                  onChange={this.handleVisualizationChange}
              >
                <MenuItem key={0} value={"absolute"}>Absolute</MenuItem>
                <MenuItem key={1} value={"percent"}>Percent</MenuItem>
                <MenuItem key={2} value={"increment"}>Increment</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={8}>
            <TextField fullWidth id="standard-required" label="Latest N days" value={this.state.slice} onChange={this.changeDays} />
          </Grid>

          <Grid item xs={12}>
            <canvas id="canvas" ref={this.chartRef}>
            </canvas>
          </Grid>
        </Grid>
    )
  }
}

export default App;
