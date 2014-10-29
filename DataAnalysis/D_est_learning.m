files=dir('logs');
Sh = 2; Sw = 3;
F=0;
for i=3:length(files)
    n = files(i).name
    try
        ldata = loadjson(['logs/' n]);
        F = F + 1;
    catch err
        error = 1;
        err
    end;
    f = fieldnames(ldata);
    d=ldata.exp1;
    reald=[];
    estd=[];
    names=fieldnames(d);
    N=length(names);
    for i=1:N
        t = d.(names{i});
        if length(t.distance_estimations) > 0
            estd = [estd t.distance_estimations(1)];
            reald = [reald t.real_distances(1)];
        end;
    end;
    subplot(Sh, Sw, F);
    err = 100./reald.*abs(estd-reald);
    plot(err);
    hold on;
    plot(1:length(err), ones(1, length(err))*20, 'r');
    %scatter(1:length(err), estd, 'k');
    %scatter(1:length(err), reald, 'g');
    title(num2str(corrcoef(reald, estd)));
end;
