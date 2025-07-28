import click
import requests

@click.group()
def cli():
    pass

@cli.command()
@click.argument('operation')
@click.argument('input_data')
def calculate(operation, input_data):
    resp = requests.post('http://localhost:8000/calculate/', json={"operation": operation, "input_data": input_data})
    click.echo(resp.json())

if __name__ == '__main__':
    cli()
