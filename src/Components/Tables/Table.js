import React, {Component} from 'react';
import Grid from "@material-ui/core/Grid";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Paper from "@material-ui/core/Paper";
import TableBody from "@material-ui/core/TableBody";
import TableUi from "@material-ui/core/Table";

class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      labels: props.labels,
      deaths: props.deaths,
      recovered: props.recovered,
      confirmed: props.confirmed
    };
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      labels: nextProps.labels,
      deaths: nextProps.deaths,
      recovered: nextProps.recovered,
      confirmed: nextProps.confirmed
    })
  }

  render() {
    let {deaths, recovered, confirmed, labels} = this.state

    return (
        <Grid container spacing={2}>
          <TableContainer component={Paper}>
            <TableUi size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell>Day</TableCell>
                  {deaths.length > 0 ? <TableCell align="right">Deaths</TableCell> : null}
                  {recovered.length > 0 ? <TableCell align="right">Recovered</TableCell> : null}
                  {confirmed.length > 0 ? <TableCell align="right">Confirmed</TableCell> : null}
                </TableRow>
              </TableHead>
              <TableBody>
                {labels.map((element, index) => {
                  return (
                      <TableRow key={element}>
                        <TableCell component="th" scope="row">
                          {element}
                        </TableCell>
                        {deaths.length > 0 ? <TableCell align="right">{deaths[index]}</TableCell> : null}
                        {recovered.length > 0 ? <TableCell align="right">{recovered[index]}</TableCell> : null}
                        {confirmed.length > 0 ? <TableCell align="right">{confirmed[index]}</TableCell> : null}
                      </TableRow>
                  )
                })}
              </TableBody>
            </TableUi>
          </TableContainer>
        </Grid>
    )
  }
}

export default Table