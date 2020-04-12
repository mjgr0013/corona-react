import React, {Component} from 'react';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

class HighchartsLine extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chartData: this.prepareOptionsWithProps(props)
    };
  }

  getDefaultStructure() {
    return {
      chart: {
        type: 'line'
      },
      title: {
        text: ''
      },
      subtitle: {
        text: 'Source: WorldClimate.com'
      },
      xAxis: {
        categories: []
      },
      yAxis: {
        title: {
          text: 'Value'
        }
      },
      plotOptions: {
        line: {
          dataLabels: {
            enabled: true
          },
          enableMouseTracking: false
        }
      },
      series: []
    };
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      chartData: this.prepareOptionsWithProps(nextProps)
    })
  }

  prepareOptionsWithProps(props) {
    let newOptions = this.getDefaultStructure()
    let {title, labels, dataset} = props;

    newOptions.title.text = title;
    newOptions.xAxis.categories = labels

    dataset.map(element => {
      newOptions.series.push({
        name: element.name,
        data: element.data
      })
    })

    return newOptions
  }

  render() {
    return (
        <HighchartsReact
            highcharts={Highcharts}
            options={this.state.chartData}
        />
    )
  }
}

export default HighchartsLine