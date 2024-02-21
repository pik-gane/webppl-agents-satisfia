import subprocess


#Verschiedene Werte
maxLambda_values = [0.95, 0.98, 1.0]
aleph0_values = [1.44, 1.5, 1.6]

# Iterieren über die Kombinationen von maxLambda und aleph0
for maxLambda in maxLambda_values:
    for aleph0 in aleph0_values:
        #  Befehl mit den aktuellen Werten
        command = f"webppl --require webppl-dp --require webppl-json --require . restaurant_choice.wppl -- -maxLambda {maxLambda} --aleph0 {aleph0}"
        
        # Befehl in der Konsole 
        subprocess.run(command, shell=True, check=True)















