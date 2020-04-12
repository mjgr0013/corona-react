import React, {Component} from 'react';
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
import HighchartsLine from "./Components/Graphs/HighchartsLine";
import Table from "./Components/Tables/Table"

class App extends Component {
  state = {
    countries: [],
    country: 'Spain',
    slice: 30,
    completeData: null,
    data: null,
    visualization: 'increment',
    deathsDataset: true,
    confirmedDataset: false,
    recoveredDataset: false,
    dataLoaded: false,
  }

  fetchData() {
    fetch('https://pomber.github.io/covid19/timeseries.json')
        .then(response => {
          return response.json();
        })
        .then(myJson => {
          this.setState({
            completeData: myJson,
            data: this.buildFormattedData(myJson[this.state.country]),
            countries: Object.keys(myJson),
            dataLoaded: true
          })
        });

    /*this.setState({
      completeData: timeseries,
      data: this.buildFormattedData(timeseries[this.state.country]),
      countries: Object.keys(timeseries),
      dataLoaded: true
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
          this.setState({
            country: myJson.country_name
          }, () => {
            this.fetchData()
          })
        })
  }

  changeCountry = e => {
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

  getDataForHighCharts() {
    let datasets = [];
    let {data, slice, visualization, deathsDataset, recoveredDataset, confirmedDataset} = this.state
    let labels = pluck(data, 'date').slice(-slice)

    if (deathsDataset) {
      let deaths = this.fetchDataByVisualization(data, 'deaths', visualization).slice(-slice);

      datasets.push({
        name: 'deaths',
        data: deaths
      })
    }

    if (confirmedDataset) {
      let confirmed = this.fetchDataByVisualization(data, 'confirmed', visualization).slice(-slice);

      datasets.push({
        name: 'confirmed',
        data: confirmed
      })
    }

    if (recoveredDataset) {
      let recovered = this.fetchDataByVisualization(data, 'recovered', visualization).slice(-slice);

      datasets.push({
        name: 'recovered',
        data: recovered
      })
    }

    return {
      labels: labels,
      dataset: datasets
    }
  }

  getDataForTable() {
    let {data, slice, visualization, deathsDataset, recoveredDataset, confirmedDataset} = this.state

    let labels = pluck(data, 'date').slice(-slice)
    let deaths = deathsDataset ? this.fetchDataByVisualization(data, 'deaths', visualization).slice(-slice) : []
    let confirmed = confirmedDataset ? this.fetchDataByVisualization(data, 'confirmed', visualization).slice(-slice) : []
    let recovered = recoveredDataset ? this.fetchDataByVisualization(data, 'recovered', visualization).slice(-slice) : []

    return {
      deaths: deaths,
      confirmed: confirmed,
      recovered: recovered,
      labels: labels
    }
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

          {this.state.dataLoaded ? <HighchartsLine title={"COVID-19 Report"} {...this.getDataForHighCharts()} /> : null}
          {this.state.dataLoaded ? <Table {...this.getDataForTable()} /> : null}

        </div>
    )
  }
}

export default App;
