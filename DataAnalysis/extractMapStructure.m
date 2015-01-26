function [ mapstructure ] = extractMapStructure( protocols, cues )
%EXTRACTMAPSTRUCTURE Summary of this function goes here
%   Detailed explanation goes here

    if ~iscell(protocols) && mod(length(protocols), 5) == 0
        %protocols(1:5, :)
        N = length(protocols) / 5;
        p = {};
        for i=1:N
            r = {};
            for j=1:5
                r{j} = protocols(floor((i-1)*5)+j, :);
            end;
            p{i} = r;
        end;
        protocols = p;
    end;

    
    useditems = {}; u=1;
    mapstructure = {}; m=1;
    try
        items = protocols{1};


        N = length(items);
        for tuplelength = 2:(N-2)
            comb = nchoosek(items, tuplelength);
            for i=1:length(comb)
                % check if the i'th possible tuple occurs in ALL recall protocols EXCEPT where the cue was one of the tuple elements...
                C = comb(i, :); % i'th tuple
                occurs = true;

                permutations = perms(C);
                for j=1:length(protocols)
                    if ~occurs
                        break;
                    end;
                    occurs = false; % must occur (checked below)...

                    P = protocols{j};
                    if arrayContains(C, P(1)) && cues(j) >= 0 % < 0 means: free recall (no cue)
                        % ...except if one of the elements of this submap was cued (P1 is the cue)
                        occurs = true;
                    else
                        for k=1:length(permutations)
                            if arrayContains(protocols{j}, permutations(k, :))
                                occurs = true;
                                break;
                            end;
                        end;
                    end;
                end;

                % if it does occur in all protocols, then this combination is a valid submap
                if occurs
                    C = comb(i, :);
                    mapstructure{m} = C;
                    m = m + 1;
                    %mapstructure.push([items.length-tuplelength-1].concat(comb[i]));
                    for j=1:length(C)
                        if ~arrayContains(useditems, {C(j)})
                            useditems{u} = C(j);
                            u = u + 1;
                        end;
                    end;
                end
            end
        end;


        %add unused elements to map
        for i=1:length(items)
            if ~arrayContains(useditems, {items(i)})
                mapstructure{m} = items(i);
                m = m + 1;
            end;
        end;
        
        mapstructure


%         nmap = {}; n=1;
%         for i=1:length(items)
%             if ~arrayContains(useditems, {items(i)})
%                 %mapstructure{m} = items(i);
%                 nmap{n} = items{i};
%                 n = n+1;
%             end;
%         end;
%         mapstructure{m} = nmap;
        
    catch ex
        ex
    end;
end

